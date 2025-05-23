import { File as NextFile } from 'web-file-polyfill';
import { GoogleDriveFile } from '../types';

export interface UploadResult {
  id: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  size?: number;
  [key: string]: any;
}

export interface IFilesystemProvider {
  uploadFile(file: NextFile, options: { folderId?: string, [key: string]: any }): Promise<UploadResult | null>;
  createFolder?(name: string, options?: any): Promise<string | null>;
  // Add more methods as needed (delete, list, etc)
}

export abstract class AbstractFilesystemProvider implements IFilesystemProvider {
  abstract uploadFile(file: NextFile, options: { folderId?: string, [key: string]: any }): Promise<UploadResult | null>;
  async createFolder?(name: string, options?: any): Promise<string | null>;
}

// Google Drive implementation
import { Session } from 'next-auth';
import { uploadFileToDrive, createDriveFolder } from './google-drive';

export class GoogleDriveProvider extends AbstractFilesystemProvider {
  private session: Session;
  constructor(session: Session) {
    super();
    this.session = session;
  }
  async uploadFile(file: NextFile, options: { folderId?: string }): Promise<UploadResult | null> {
    if (!options.folderId) throw new Error('folderId is required for Google Drive uploads');
    const driveFile = await uploadFileToDrive(this.session, file, options.folderId);
    if (!driveFile) return null;
    return {
      id: driveFile.id,
      name: driveFile.name,
      url: driveFile.webContentLink,
      thumbnailUrl: driveFile.thumbnailLink,
      size: driveFile.size ? Number(driveFile.size) : undefined,
      ...driveFile,
    };
  }
  async createFolder(name: string): Promise<string | null> {
    return createDriveFolder(this.session, name);
  }
}

// You can add LocalDiskProvider, S3Provider, GoogleBucketProvider similarly.
