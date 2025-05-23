import fs from 'fs/promises';
import path from 'path';
import { IFilesystemProvider, AbstractFilesystemProvider, UploadResult } from './filesystem';

const UPLOADS_ROOT = process.env.LOCAL_UPLOADS_ROOT || path.resolve(process.cwd(), 'uploads');

export class LocalDiskProvider extends AbstractFilesystemProvider implements IFilesystemProvider {
  async uploadFile(file: File, options: { folderId?: string }): Promise<UploadResult | null> {
    const folder = options.folderId ? path.join(UPLOADS_ROOT, options.folderId) : UPLOADS_ROOT;
    await fs.mkdir(folder, { recursive: true });
    const filePath = path.join(folder, file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);
    // Store only the folderId and fileName, not a direct URL
    return {
      id: file.name,
      name: file.name,
      localPath: filePath,
      folderId: options.folderId || '',
      size: buffer.length,
      url: undefined, // Do not return a direct URL
    };
  }

  async createFolder(name: string): Promise<string | null> {
    const folderPath = path.join(UPLOADS_ROOT, name);
    await fs.mkdir(folderPath, { recursive: true });
    return name;
  }
}
