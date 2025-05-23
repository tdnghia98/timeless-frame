import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/utils/prisma';
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } from '@azure/storage-blob';
import { authOptions } from '../../auth/[...nextauth]/route';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const AZURE_CONTAINER = process.env.AZURE_CONTAINER!;
const AZURE_BASE_URL = process.env.AZURE_BASE_URL || `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER}`;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER);

export async function GET(req: NextRequest) {
  // /api/download/azure?eventId=...&blobName=...
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const blobName = searchParams.get('blobName');
  if (!eventId || !blobName) {
    return NextResponse.json({ error: 'Missing eventId or blobName' }, { status: 400 });
  }
  // Check if user is event owner
  const session = await getServerSession(authOptions);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  let isOwner = false;
  if (session && event && session.user?.email === event.userId) {
    isOwner = true;
  }
  // Set expiry: 7 days for owner, 1 hour for public
  const expiresOn = isOwner
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 60 * 60 * 1000);
  let url = `${AZURE_BASE_URL}/${blobName}`;
  try {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT_NAME!,
      process.env.AZURE_STORAGE_ACCOUNT_KEY!
    );
    const sasToken = generateBlobSASQueryParameters({
      containerName: AZURE_CONTAINER,
      blobName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn: new Date(),
      expiresOn,
      protocol: SASProtocol.Https,
    }, sharedKeyCredential).toString();
    url = `${url}?${sasToken}`;
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate SAS URL' }, { status: 500 });
  }
  // Redirect to the signed URL
  return NextResponse.redirect(url);
}
