import { Upload } from "@wedmemory/shared";
import { backendHttpClient } from "../utils/backendHttpClient";
import { CreateUploadFormData, IUploadsRepository } from "./IUploadsRepository";

export class HttpUploadsRepository implements IUploadsRepository {
  create(data: CreateUploadFormData): Promise<Upload> {
    return backendHttpClient.post<Upload>("/uploads", data)
  }
  createMultiple(data: CreateUploadFormData[]): Promise<Upload[]> {
    for (const photo of data) {
      if (!photo.userEmail || !photo.file) {
        throw new Error("Invalid photo data");
      }
    }
    return backendHttpClient.post<Upload[]>("/uploads", data);
  }
  update(id: string, data: { url?: string; description?: string; }): Promise<Upload | null> {
    return backendHttpClient.patch<Upload | null>(`/uploads/${id}`, data);
  }
  delete(id: string): Promise<void> {
    return backendHttpClient.delete<void>(`/uploads/${id}`);
  }
  getAll(): Promise<Upload[]> {
    return backendHttpClient.get<Upload[]>("/uploads");
  }
  getById(id: string): Promise<Upload | null> {
    return backendHttpClient.get<Upload | null>(`/uploads/${id}`);
  }
  getByUserId(userId: string): Promise<Upload[]> {
    return backendHttpClient.get<Upload[]>(`/uploads?userId=${userId}`);
  }
  getByEventId(eventId: string): Promise<Upload[]> {
    return backendHttpClient.get<Upload[]>(`/uploads?eventId=${eventId}`);
  }
}
