import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { ReadStream } from 'fs';

dotenv.config();

const bucketName = 'resume-site-pictures';
const credentials = {
  accessKeyId: process.env.TEBIO_ACCESS_KEY as string,
  secretAccessKey: process.env.TEBIO_SECRET_KEY as string
};

// Create an S3 service client object.
const s3Client = new S3Client({
  endpoint: 'https://s3.tebi.io',
  credentials: credentials,
  region: 'global'
});

export async function uploadFile(uniqueFileName: string, fileStream: ReadStream, file: Express.Multer.File) {
  const uploadParams = {
    Bucket: bucketName,
    Key: uniqueFileName,
    Body: fileStream,
    ContentType: file.mimetype
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  const imageUrl = `https://s3.tebi.io/resume-site-pictures/${uniqueFileName}`;
  return imageUrl;
}
