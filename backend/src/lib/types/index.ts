export interface Event {
  id: string;
  title: string;
  description: string;
  theme?: string;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  folderId?: string; // Google Drive folder ID
  qrCode?: string; // QR code data URL
  shareUrl?: string; // URL for sharing with guests
  authorRefreshToken?: string;
  storageProvider?: string; // Add this field for backend compatibility
}

export interface Upload {
  id: string;
  eventId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileId: string; // Google Drive file ID
  thumbnailUrl?: string;
  downloadUrl?: string;
  uploadedBy?: string; // Guest name or email
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  size?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: Date | string;
  theme?: string;
  storageProvider?: string; // Add this field for backend compatibility
  authorRefreshToken?: string; // For Google Drive uploads
}

export interface UploadFormData {
  files: File[];
  name?: string;
  email?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  provider?: string;
  passwordHash?: string;
}
