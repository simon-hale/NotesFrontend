import OSS from 'ali-oss';

const createOssClient = (sts) => new OSS({
  region: sts.region,
  bucket: sts.bucket,
  accessKeyId: sts.accessKeyId,
  accessKeySecret: sts.accessKeySecret,
  stsToken: sts.securityToken,
});

export const uploadFileToOss = (sts, file) => createOssClient(sts).multipartUpload(sts.objectKey, file);
