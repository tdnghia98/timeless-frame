export interface EventFormData {
  title: string;
  description: string;
  date: string; // Use string for cross-platform compatibility
  theme?: string;
  storageProvider?: string;
}
