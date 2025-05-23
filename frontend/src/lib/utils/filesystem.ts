export interface UploadResult {
  id: string;
  name: string;
  thumbnailUrl?: string;
  size?: number;
  [key: string]: any;
}

export interface IFilesystemProvider {
  uploadFile(file: File, options: { folderId?: string, [key: string]: any }): Promise<UploadResult | null>;
  createFolder?(name: string, options?: any): Promise<string | null>;
  // Add more methods as needed (delete, list, etc)
}

export abstract class AbstractFilesystemProvider implements IFilesystemProvider {
  abstract uploadFile(file: File, options: { folderId?: string, [key: string]: any }): Promise<UploadResult | null>;
  async createFolder?(name: string, options?: any): Promise<string | null>;
}

