import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/utils/prisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { authOptions } from '../../auth/[...nextauth]/route';

const S3_BUCKET = process.env.AWS_S3_BUCKET!;
const S3_REGION = process.env.AWS_S3_REGION!;

const s3 = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  // /api/download/s3?eventId=...&s3Key=...
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const s3Key = searchParams.get('s3Key');
  if (!eventId || !s3Key) {
    return NextResponse.json({ error: 'Missing eventId or s3Key' }, { status: 400 });
  }
  // Check if user is event owner
  const session = await getServerSession(authOptions);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  let isOwner = false;
  if (session && event && session.user?.email === event.userId) {
    isOwner = true;
  }
  // Set expiry: 7 days for owner, 1 hour for public
  const expiresIn = isOwner ? 60 * 60 * 24 * 7 : 60 * 60; // seconds
  let url = '';
  try {
    url = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    }), { expiresIn });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate S3 signed URL' }, { status: 500 });
  }
  return NextResponse.redirect(url);
}
