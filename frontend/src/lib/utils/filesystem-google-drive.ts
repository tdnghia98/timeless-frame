// Google Drive implementation
import { Session } from 'next-auth';
import { uploadFileToDrive, createDriveFolder } from './google-drive';
import { AbstractFilesystemProvider, UploadResult } from './filesystem';

export class GoogleDriveProvider extends AbstractFilesystemProvider {
  private session: Session;
  constructor(session: Session) {
    super();
    this.session = session;
  }
  async uploadFile(file: File, options: { folderId?: string }): Promise<UploadResult | null> {
    if (!options.folderId) throw new Error('folderId is required for Google Drive uploads');
    const driveFile = await uploadFileToDrive(this.session, file, options.folderId);
    if (!driveFile) return null;
    return {
      ...driveFile,
      id: driveFile.id,
      name: driveFile.name,
      url: driveFile.webContentLink,
      thumbnailUrl: driveFile.thumbnailLink,
      size: Number.parseFloat(driveFile.size),
    };
  }
  async createFolder(name: string): Promise<string | null> {
    return createDriveFolder(this.session, name);
  }
}

// You can add LocalDiskProvider, S3Provider, GoogleBucketProvider similarly.
