import { StorageProviderOption } from '@/lib/types/models/storage-provider';
import { NextRequest, NextResponse } from 'next/server';

// Add a new route to return available storage providers based on env vars
// This is now /api/storages (not /api/events)
export async function OPTIONS(req: NextRequest) {
  const availableProviders: StorageProviderOption[] = [];
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    availableProviders.push({ value: 'gdrive', label: 'Google Drive' });
  }
  if (process.env.LOCAL_STORAGE_PATH) {
    availableProviders.push({ value: 'local', label: 'Local Disk' });
  }
  if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
    availableProviders.push({ value: 's3', label: 'Amazon S3' });
  }
  if (process.env.GCS_BUCKET && process.env.GCS_PROJECT_ID && process.env.GCS_CREDENTIALS) {
    availableProviders.push({ value: 'gcs', label: 'Google Cloud Storage' });
  }
  if (process.env.AZURE_STORAGE_CONNECTION_STRING && process.env.AZURE_CONTAINER) {
    availableProviders.push({ value: 'azure', label: 'Azure Blob Storage' });
  }
  return NextResponse.json({ providers: availableProviders });
}