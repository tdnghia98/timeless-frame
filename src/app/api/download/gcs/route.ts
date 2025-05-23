import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/utils/prisma';
import { Storage } from '@google-cloud/storage';
import { authOptions } from '../../auth/[...nextauth]/route';

const GCS_BUCKET = process.env.GCS_BUCKET!;
const GCS_BASE_URL = process.env.GCS_BASE_URL || `https://storage.googleapis.com/${GCS_BUCKET}`;
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: process.env.GCS_CREDENTIALS ? JSON.parse(process.env.GCS_CREDENTIALS) : undefined,
});
const bucket = storage.bucket(GCS_BUCKET);

export async function GET(req: NextRequest) {
  // /api/download/gcs?eventId=...&gcsKey=...
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const gcsKey = searchParams.get('gcsKey');
  if (!eventId || !gcsKey) {
    return NextResponse.json({ error: 'Missing eventId or gcsKey' }, { status: 400 });
  }
  // Check if user is event owner
  const session = await getServerSession(authOptions);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  let isOwner = false;
  if (session && event && session.user?.email === event.userId) {
    isOwner = true;
  }
  // Set expiry: 7 days for owner, 1 hour for public
  const expires = Date.now() + (isOwner ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000); // ms
  let url = `${GCS_BASE_URL}/${gcsKey}`;
  try {
    const file = bucket.file(gcsKey);
    [url] = await file.getSignedUrl({
      action: 'read',
      expires,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate GCS signed URL' }, { status: 500 });
  }
  return NextResponse.redirect(url);
}
