import { StorageProviderOption } from '@/lib/types/models/storage-provider';
import { getAccessToken } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchStorageProviders(): Promise<StorageProviderOption[]> {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_URL}/storages`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch storage providers');
  const data = await res.json();
  return data.providers || [];
}