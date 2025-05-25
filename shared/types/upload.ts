// shared/types/upload.ts
export interface Upload {
  id: string;
  eventId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileId: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  uploadedBy?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UploadErrorResponse {
  error: string;
}

export type UploadsGetResponse = Upload[];
export type UploadCreateResponse = Upload | UploadErrorResponse;
