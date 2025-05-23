import { Storage } from '@google-cloud/storage';
import { IFilesystemProvider, AbstractFilesystemProvider, UploadResult } from './filesystem';
import { File as NextFile } from 'web-file-polyfill';
import path from 'path';

const GCS_BUCKET = process.env.GCS_BUCKET!;
const GCS_BASE_URL = process.env.GCS_BASE_URL || `https://storage.googleapis.com/${GCS_BUCKET}`;

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: process.env.GCS_CREDENTIALS ? JSON.parse(process.env.GCS_CREDENTIALS) : undefined,
});
const bucket = storage.bucket(GCS_BUCKET);

export class GCSProvider extends AbstractFilesystemProvider implements IFilesystemProvider {
  async uploadFile(file: NextFile, options: { folderId?: string }): Promise<UploadResult | null> {
    const key = options.folderId ? `${options.folderId}/${file.name}` : file.name;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileObj = bucket.file(key);
    await fileObj.save(buffer, {
      contentType: file.type,
      resumable: false,
      public: true,
    });
    return {
      id: key,
      name: file.name,
      url: `${GCS_BASE_URL}/${key}`,
      size: buffer.length,
      gcsKey: key,
    };
  }

  async createFolder(name: string): Promise<string | null> {
    // GCS is flat, but we can create a zero-byte object to represent a folder
    const folderKey = name.endsWith('/') ? name : `${name}/`;
    const fileObj = bucket.file(folderKey);
    await fileObj.save('', { resumable: false, public: true });
    return name;
  }
}
