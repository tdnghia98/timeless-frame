import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/utils/prisma';
import path from 'path';
import fs from 'fs/promises';
import { authOptions } from '../../auth/[...nextauth]/route';

const UPLOADS_ROOT = process.env.LOCAL_UPLOADS_ROOT || path.resolve(process.cwd(), 'uploads');

export async function GET(req: NextRequest) {
  // /api/download/local?eventId=...&folderId=...&fileName=...
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const folderId = searchParams.get('folderId') || '';
  const fileName = searchParams.get('fileName');
  if (!eventId || !fileName) {
    return NextResponse.json({ error: 'Missing eventId or fileName' }, { status: 400 });
  }
  // Check if user is event owner
  const session = await getServerSession(authOptions);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  let isOwner = false;
  if (session && event && session.user?.email === event.userId) {
    isOwner = true;
  }
  // Build file path
  const filePath = path.join(UPLOADS_ROOT, folderId, fileName);
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error('Not a file');
    // For public, optionally add rate limiting, watermarking, etc.
    // For now, just stream the file
    const fileBuffer = await fs.readFile(filePath);
    // Set appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': isOwner ? 'public, max-age=604800' : 'public, max-age=3600',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 });
  }
}
