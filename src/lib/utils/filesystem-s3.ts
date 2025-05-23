import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { IFilesystemProvider, AbstractFilesystemProvider, UploadResult } from './filesystem';
import { File as NextFile } from 'web-file-polyfill';
import path from 'path';

const S3_BUCKET = process.env.AWS_S3_BUCKET!;
const S3_REGION = process.env.AWS_S3_REGION!;
const S3_BASE_URL = process.env.AWS_S3_BASE_URL || `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

const s3 = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export class S3Provider extends AbstractFilesystemProvider implements IFilesystemProvider {
  async uploadFile(file: NextFile, options: { folderId?: string }): Promise<UploadResult | null> {
    const key = options.folderId ? `${options.folderId}/${file.name}` : file.name;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));
    return {
      id: key,
      name: file.name,
      url: `${S3_BASE_URL}/${key}`,
      size: buffer.length,
      s3Key: key,
    };
  }

  async createFolder(name: string): Promise<string | null> {
    // S3 is flat, but we can create a zero-byte object to represent a folder
    const folderKey = name.endsWith('/') ? name : `${name}/`;
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: folderKey,
      Body: '',
    }));
    return name;
  }
}
