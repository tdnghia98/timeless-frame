export interface Event {
  id: string;
  title: string;
  description: string;
  theme?: string;
  date: string; // Use string for cross-platform compatibility
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  qrCode?: string;
  shareUrl?: string;
}
