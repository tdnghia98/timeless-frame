import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { StorageProviderOption } from '../lib/types/models/storage-provider';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('storages')
@UseGuards(JwtAuthGuard)
export class StoragesController {
  @Get()
  async getStorages(@Req() req: Request, @Res() res: Response) {
    const availableProviders: StorageProviderOption[] = [];
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      availableProviders.push({ value: 'gdrive', label: 'Google Drive' });
    }
    if (process.env.LOCAL_STORAGE_PATH || process.env.LOCAL_UPLOADS_ROOT) {
      availableProviders.push({ value: 'local', label: 'Local Disk' });
    }
    if (
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
    ) {
      availableProviders.push({ value: 's3', label: 'Amazon S3' });
    }
    if (
      process.env.GCS_BUCKET &&
      process.env.GCS_PROJECT_ID &&
      process.env.GCS_CREDENTIALS
    ) {
      availableProviders.push({ value: 'gcs', label: 'Google Cloud Storage' });
    }
    if (
      process.env.AZURE_STORAGE_CONNECTION_STRING &&
      process.env.AZURE_CONTAINER
    ) {
      availableProviders.push({ value: 'azure', label: 'Azure Blob Storage' });
    }
    return res.json({ providers: availableProviders });
  }
}
