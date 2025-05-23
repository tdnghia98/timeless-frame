import { BlobServiceClient } from '@azure/storage-blob';
import { IFilesystemProvider, AbstractFilesystemProvider, UploadResult } from './filesystem';
import { File as NextFile } from 'web-file-polyfill';
import path from 'path';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const AZURE_CONTAINER = process.env.AZURE_CONTAINER!;
const AZURE_BASE_URL = process.env.AZURE_BASE_URL || `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER}`;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER);

export class AzureBlobProvider extends AbstractFilesystemProvider implements IFilesystemProvider {
  async uploadFile(file: NextFile, options: { folderId?: string }): Promise<UploadResult | null> {
    const blobName = options.folderId ? `${options.folderId}/${file.name}` : file.name;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: file.type },
    });
    return {
      id: blobName,
      name: file.name,
      url: `${AZURE_BASE_URL}/${blobName}`,
      size: buffer.length,
      azureBlob: blobName,
    };
  }

  async createFolder(name: string): Promise<string | null> {
    // Azure Blob Storage is flat, but we can create a zero-byte blob to represent a folder
    const folderKey = name.endsWith('/') ? name : `${name}/`;
    const blockBlobClient = containerClient.getBlockBlobClient(folderKey);
    await blockBlobClient.uploadData(Buffer.alloc(0));
    return name;
  }
}
