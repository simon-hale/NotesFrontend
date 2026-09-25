import OSS from 'ali-oss';

/* ------------------------------------------------------------------ *
 * Web 端 OSS 单文件上传。
 *
 * 传输不变量：
 * 1. 一次上传只允许写一个 objectKey：STS 作用域（bucket / region /
 *    objectKey）在创建客户端时冻结，官方凭证刷新回调返回的票据必须与
 *    冻结作用域完全一致，否则 fail closed，绝不带着别处的凭证继续传；
 * 2. 页面内重试复用 progress 回调返回的 checkpoint，从已完成的分片继续；
 *    页面刷新/重载后不再恢复（原始 File 对象已不可用）；
 * 3. 只有 multipartUpload 正常返回（CompleteMultipartUpload 成功）才算
 *    传输完成，数据库登记由调用方在此之后进行，最终不可恢复失败时尽力
 *    abort 未完成的分片上传；
 * 4. 不在任何地方持久化 STS 凭证，也不把 AK/SK、securityToken 写入日志。
 * ------------------------------------------------------------------ */

// 每个分片固定为5MB，避免大文件的单个分片过大。
const PART_SIZE = 5 * 1024 * 1024;

// 同时上传3个分片，在速度和稳定性之间取平衡。
const PARALLEL_PARTS = 3;

// 当前项目使用的 OSS SDK timeout 单位为毫秒，设置为180秒。
const REQUEST_TIMEOUT_MS = 180 * 1000;

// 首次上传失败后，最多再自动尝试两次。
const MAX_RETRY_COUNT = 2;
const RETRY_BASE_DELAY = 500;

// ali-oss@6.23.0 中 refreshSTSTokenInterval 的单位是毫秒
// （见 lib/common/client/initOptions.js 的默认值 60000 * 5）。
// 后端 STS 有效期是 900 秒，5 分钟的刷新间隔明显短于有效期。
const STS_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// 凭证作用域校验失败的错误码。调用方据此区分“凭证指向了别的对象”
// 这一类致命错误，不要与网络抖动、后端业务错误混在一起。
export const CREDENTIAL_SCOPE_ERROR_CODE = 'credential_scope';

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const normalizeProgress = (progress) =>
  Math.min(1, Math.max(0, Number(progress) || 0));

const normalizeText = (value) =>
  typeof value === 'string' ? value.trim() : '';

const hasAllFields = (record) =>
  Object.values(record).every((value) => normalizeText(value) !== '');

const createTransferError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  // 凭证作用域异常不是瞬时故障：重试只会用同一份错误凭证再次失败，
  // 因此直接标记为不可重试，立即停下。
  error.transferRetryable = false;
  return error;
};

// 日志里只保留排查所需的字段，绝不输出 Authorization / x-oss-security-token
// 所在的请求头，也不输出完整的签名 URL 或 uploadId。
const sanitizeForLog = (value, maxLength = 200) => {
  if (typeof value !== 'string' || value === '') return '';

  const sanitized = value
    .replace(/(https?:\/\/[^\s?#]+)\?[^\s]*/gi, '$1?<redacted>')
    .replace(
      /([?&\s](?:uploadId|security-token|SecurityToken|Signature|OSSAccessKeyId|Expires|token|partNumber)=)[^&\s]*/gi,
      '$1<redacted>'
    );

  return sanitized.length > maxLength
    ? `${sanitized.slice(0, maxLength)}…`
    : sanitized;
};

// ali-oss 抛出的错误对象带有 params（含签名请求头），不能整体写进日志。
const describeTransferError = (error) => ({
  name: error?.name,
  code: error?.code,
  status: error?.status ?? error?.statusCode ?? error?.response?.status,
  partNum: error?.partNum,
  message: sanitizeForLog(error?.message),
});

const isRetryableError = (error) => {
  // 传输层明确标记为不可重试的错误（例如后端鉴权失败、业务错误、
  // 凭证作用域不一致）直接失败，不做无意义的重试。
  if (error?.transferRetryable === false) {
    return false;
  }

  const status = Number(
    error?.status ||
    error?.statusCode ||
    error?.response?.status
  );

  const errorText = [
    error?.name,
    error?.code,
    error?.message,
  ].filter(Boolean).join(' ');

  // 网络断开、连接重置、超时等没有稳定HTTP状态码的错误。
  if (
    /timeout|network|connection|socket|ECONNRESET|RequestError/i.test(
      errorText
    )
  ) {
    return true;
  }

  // 没有状态码时通常属于浏览器网络层错误。
  if (!status) {
    return true;
  }

  // 仅重试超时、限流和服务器错误。
  return status === 408 || status === 429 || status >= 500;
};

// ali-oss 需要的凭证形状：只返回这三个字段，多余的键会被
// Object.assign(options, credentials) 合并进客户端配置。
const readCredentials = (ticket) => ({
  accessKeyId: normalizeText(ticket?.accessKeyId),
  accessKeySecret: normalizeText(ticket?.accessKeySecret),
  stsToken: normalizeText(ticket?.securityToken),
});

const readScope = (ticket) => ({
  bucket: normalizeText(ticket?.bucket),
  region: normalizeText(ticket?.region),
  objectKey: normalizeText(ticket?.objectKey),
});

const assertCompleteScope = (scope) => {
  if (!hasAllFields(scope)) {
    throw createTransferError(
      CREDENTIAL_SCOPE_ERROR_CODE,
      'STS ticket is missing bucket, region or objectKey'
    );
  }
};

const assertCompleteCredentials = (credentials) => {
  if (!hasAllFields(credentials)) {
    throw createTransferError(
      CREDENTIAL_SCOPE_ERROR_CODE,
      'STS ticket is missing accessKeyId, accessKeySecret or securityToken'
    );
  }
};

// 刷新后的票据必须仍然指向同一个对象，否则 fail closed。
const assertSameScope = (scope, nextScope) => {
  if (
    scope.bucket !== nextScope.bucket ||
    scope.region !== nextScope.region ||
    scope.objectKey !== nextScope.objectKey
  ) {
    throw createTransferError(
      CREDENTIAL_SCOPE_ERROR_CODE,
      'Refreshed STS ticket targets a different object'
    );
  }
};

/**
 * 构造 ali-oss 官方凭证刷新回调。
 *
 * SDK 在每次 OSS 请求前检查 refreshSTSTokenInterval，必要时调用
 * refreshSTSToken()，并把返回值合并进客户端配置。并发分片可能同时触发
 * 刷新，这里共用在途请求：既避免重复请求后端，也保证并发分片拿到同一份
 * 新凭证。
 */
const createRefreshHandler = ({ scope, refreshTicket }) => {
  let pendingRefresh = null;

  return () => {
    if (!pendingRefresh) {
      pendingRefresh = (async () => {
        try {
          const ticket = await refreshTicket();
          const nextScope = readScope(ticket);
          const nextCredentials = readCredentials(ticket);

          assertCompleteScope(nextScope);
          assertSameScope(scope, nextScope);
          assertCompleteCredentials(nextCredentials);

          return nextCredentials;
        } finally {
          pendingRefresh = null;
        }
      })();
    }

    return pendingRefresh;
  };
};

const createOssClient = ({ credentials, scope, refreshTicket }) =>
  new OSS({
    region: scope.region,
    bucket: scope.bucket,
    accessKeyId: credentials.accessKeyId,
    accessKeySecret: credentials.accessKeySecret,
    stsToken: credentials.stsToken,

    secure: true,
    // 单个OSS请求最长允许180秒。
    timeout: REQUEST_TIMEOUT_MS,

    // 长上传过程中由 SDK 自动续期 STS，凭证只存在于内存中。
    refreshSTSTokenInterval: STS_REFRESH_INTERVAL_MS,
    refreshSTSToken: createRefreshHandler({ scope, refreshTicket }),
  });

const abortMultipartUploadSafely = async (client, checkpoint) => {
  if (!checkpoint?.name || !checkpoint?.uploadId) {
    return;
  }

  try {
    await client.abortMultipartUpload(
      checkpoint.name,
      checkpoint.uploadId
    );
  } catch (cleanupError) {
    // 清理属于兜底操作，失败不能覆盖真正的上传异常。
    console.warn(
      'Failed to clean up OSS multipart upload:',
      describeTransferError(cleanupError)
    );
  }
};

/**
 * 上传单个文件到OSS。
 *
 * multipartUpload resolve 即代表 CompleteMultipartUpload 已成功。
 *
 * @param {Object} options
 * @param {File} options.file 浏览器File对象
 * @param {Object} options.ticket 初始STS票据（作用域已在调用方校验）
 * @param {Function} options.refreshTicket STS刷新回调，仍必须指向同一个
 *   stringOfPath / parentId / filename
 * @param {Function} [options.onProgress] 当前文件进度回调，参数范围0～1
 * @returns {Promise<Object>} OSS上传结果
 */
export const uploadFileToOss = async ({
  file,
  ticket,
  refreshTicket,
  onProgress,
} = {}) => {
  if (!file) {
    throw new Error('uploadFileToOss requires a file');
  }

  if (typeof refreshTicket !== 'function') {
    throw new Error('uploadFileToOss requires a refreshTicket callback');
  }

  const credentials = readCredentials(ticket);
  const scope = readScope(ticket);

  // 初始票据同样要校验完整，否则直接失败而不是带着半截凭证去请求OSS。
  assertCompleteScope(scope);
  assertCompleteCredentials(credentials);

  const client = createOssClient({
    credentials,
    scope,
    refreshTicket,
  });

  // 空文件没有可拆分的数据，直接简单上传并报告100%。
  if (file.size === 0) {
    const result = await client.put(scope.objectKey, file);
    onProgress?.(1);
    return result;
  }

  let checkpoint;

  for (
    let retryCount = 0;
    retryCount <= MAX_RETRY_COUNT;
    retryCount += 1
  ) {
    try {
      return await client.multipartUpload(
        scope.objectKey,
        file,
        {
          parallel: PARALLEL_PARTS,
          partSize: PART_SIZE,

          // 重试时传入最近一次成功分片产生的断点。
          checkpoint,

          progress: (progress, currentCheckpoint) => {
            // CompleteMultipartUpload 结束时 SDK 会回调 progress(1, null)，
            // 此时不能覆盖已经记录的分片断点。
            if (currentCheckpoint) {
              checkpoint = currentCheckpoint;
            }

            onProgress?.(
              normalizeProgress(progress)
            );
          },
        }
      );
    } catch (error) {
      const canRetry =
        retryCount < MAX_RETRY_COUNT &&
        isRetryableError(error);

      if (!canRetry) {
        // 最终失败后，尽量删除已经上传但尚未合并的分片。
        await abortMultipartUploadSafely(
          client,
          checkpoint
        );

        throw error;
      }

      console.warn(
        `OSS upload retry ${retryCount + 1}/${MAX_RETRY_COUNT}:`,
        sanitizeForLog(file.name),
        describeTransferError(error)
      );

      // 500ms、1000ms递增等待，避免网络异常时立即重复请求。
      await sleep(
        RETRY_BASE_DELAY * (2 ** retryCount)
      );
    }
  }

  // 理论上循环一定会return或throw，这里只是代码兜底。
  throw new Error('Unexpected OSS upload state');
};
