// Remove migrated types, import from @wedmemory/shared-types instead

export interface EventFormData {
  title: string;
  description: string;
  date: Date | string;
  theme?: string;
  storageProvider?: string; // Add this field for backend compatibility
}

export interface UploadFormData {
  files: File[];
  name?: string;
  email?: string;
}