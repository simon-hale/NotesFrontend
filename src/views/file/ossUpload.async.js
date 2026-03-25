import OSS from 'ali-oss';

export const createOssClient = (sts) => new OSS({
  region: sts.region,
  bucket: sts.bucket,
  accessKeyId: sts.accessKeyId,
  accessKeySecret: sts.accessKeySecret,
  stsToken: sts.securityToken,
});

export const uploadFileToOss = async (sts, file) => {
  const client = createOssClient(sts);
  return client.multipartUpload(sts.objectKey, file);
};
