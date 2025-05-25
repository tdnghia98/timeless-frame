import { Upload } from "@wedmemory/shared";

export interface IUploadsRepository {
  create(data: CreateUploadFormData): Promise<Upload>;
  createMultiple(data: CreateUploadFormData[]): Promise<Upload[]>;
  update(id: string, data: { url?: string; description?: string }): Promise<Upload | null>;
  delete(id: string): Promise<void>;
  getAll(): Promise<Upload[]>;
  getById(id: string): Promise<Upload | null>;
  getByUserId(userId: string): Promise<Upload[]>;
  getByEventId(eventId: string): Promise<Upload[]>;
}

export type CreateUploadFormData = {
  userEmail: string;
  file: File;
};