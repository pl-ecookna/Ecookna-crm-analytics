import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

export const s3 = new S3Client({
  endpoint: env.s3.endpoint,
  region: env.s3.region,
  forcePathStyle: false,
  credentials: {
    accessKeyId: env.s3.accessKeyId,
    secretAccessKey: env.s3.secretAccessKey,
  },
});

export const uploadToS3 = async ({ key, body, contentType = 'audio/mpeg' }) => {
  await s3.send(new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
};

export const downloadFromS3 = async (key) => {
  const out = await s3.send(new GetObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
  }));

  const chunks = [];
  for await (const chunk of out.Body) chunks.push(chunk);
  return Buffer.concat(chunks);
};

export const getPublicS3Url = (key) => `${env.s3.endpoint}/${env.s3.bucket}/${key}`;
