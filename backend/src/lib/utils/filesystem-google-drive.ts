import { AbstractFilesystemProvider } from './filesystem';
import { GoogleDriveFile } from '../types';
import { uploadFileToDrive, createDriveFolder } from './google-drive';

export class GoogleDriveProvider extends AbstractFilesystemProvider {
  async uploadFile(
    file: File,
    options: { accessToken: string; refreshToken: string; folderId: string },
  ): Promise<any> {
    const { accessToken, refreshToken, folderId } = options;
    if (!folderId) {
      throw new Error('folderId is required for Google Drive uploads');
    }
    const driveFile = await uploadFileToDrive(accessToken, refreshToken, file, folderId);
    return {
      id: driveFile?.id,
      fileName: driveFile?.name,
      fileType: driveFile?.mimeType,
      fileSize: driveFile?.size ? Number(driveFile.size) : undefined,
      fileId: driveFile?.id,
      thumbnailUrl: driveFile?.thumbnailLink,
      downloadUrl: driveFile?.webContentLink,
    };
  }

  async createFolder(
    name: string,
    options: { accessToken: string; refreshToken: string },
  ): Promise<string | null> {
    const { accessToken, refreshToken } = options;
    return createDriveFolder(accessToken, refreshToken, name);
  }
}

// You can add LocalDiskProvider, S3Provider, GoogleBucketProvider similarly.
