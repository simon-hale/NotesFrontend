import OSS from 'ali-oss';

// 原上传js
// const createOssClient = (sts) => new OSS({
//   region: sts.region,
//   bucket: sts.bucket,
//   accessKeyId: sts.accessKeyId,
//   accessKeySecret: sts.accessKeySecret,
//   stsToken: sts.securityToken,
// });

// export const uploadFileToOss = (sts, file) => createOssClient(sts).multipartUpload(sts.objectKey, file);

// 新上传js

// 每个分片固定为5MB，避免大文件的单个分片过大。
const PART_SIZE = 5 * 1024 * 1024;

// 同时上传3个分片，在速度和稳定性之间取平衡。
const PARALLEL_PARTS = 3;

// OSS SDK的timeout单位为秒，默认是60秒。
const REQUEST_TIMEOUT_SECONDS = 180;

// 首次上传失败后，最多再自动尝试两次。
const MAX_RETRY_COUNT = 2;
const RETRY_BASE_DELAY = 500;

const createOssClient = (sts) => new OSS({
  region: sts.region,
  bucket: sts.bucket,
  accessKeyId: sts.accessKeyId,
  accessKeySecret: sts.accessKeySecret,
  stsToken: sts.securityToken,

  secure: true,
  // 单个OSS请求最长允许180秒。
  timeout: REQUEST_TIMEOUT_SECONDS,
});

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const normalizeProgress = (progress) =>
  Math.min(1, Math.max(0, Number(progress) || 0));

const isRetryableError = (error) => {
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
      cleanupError
    );
  }
};

/**
 * 上传单个文件到OSS。
 *
 * @param {Object} sts 后端返回的STS信息
 * @param {File} file 浏览器File对象
 * @param {Function} onProgress 当前文件进度回调，参数范围0～1
 */
export const uploadFileToOss = async (
  sts,
  file,
  onProgress
) => {
  const client = createOssClient(sts);

  // 空文件没有可拆分的数据，直接简单上传并报告100%。
  if (file.size === 0) {
    const result = await client.put(sts.objectKey, file);
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
        sts.objectKey,
        file,
        {
          parallel: PARALLEL_PARTS,
          partSize: PART_SIZE,

          // 重试时传入最近一次成功分片产生的断点。
          checkpoint,

          progress: (progress, currentCheckpoint) => {
            checkpoint = currentCheckpoint;

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
        file.name,
        error
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