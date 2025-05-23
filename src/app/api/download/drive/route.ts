import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/utils/prisma';
import { google } from 'googleapis';
import { decrypt } from '@/lib/utils/crypto';
import { authOptions } from '../../auth/[...nextauth]/route';

function getDriveClientWithRefreshToken(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function GET(req: NextRequest) {
  // /api/download/drive?eventId=...&fileId=...&thumb=1
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const fileId = searchParams.get('fileId');
  const thumb = searchParams.get('thumb');
  if (!eventId || !fileId) {
    return NextResponse.json({ error: 'Missing eventId or fileId' }, { status: 400 });
  }
  // Get event and owner's refresh token
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.authorRefreshToken) {
    return NextResponse.json({ error: 'Event or credentials not found' }, { status: 404 });
  }
  const refreshToken = decrypt(event.authorRefreshToken);
  const drive = getDriveClientWithRefreshToken(refreshToken);
  // Check if user is event owner
  const session = await getServerSession(authOptions);
  const isOwner = session && event.userId && (session.user?.email === event.userId);
  try {
    if (thumb === '1') {
      // Get file metadata to find thumbnailLink and mimeType
      const meta = await drive.files.get({ fileId, fields: 'thumbnailLink, mimeType' });
      const thumbnailLink = meta.data.thumbnailLink;
      const mimeType = meta.data.mimeType || '';
      // Only try to fetch thumbnail for images/videos
      if (!thumbnailLink || (!mimeType.startsWith('image/') && !mimeType.startsWith('video/'))) {
        return new NextResponse(null, { status: 404 });
      }
      // Proxy the thumbnail
      const resp = await fetch(thumbnailLink);
      const contentType = resp.headers.get('content-type') || 'image/jpeg';
      if (!contentType.startsWith('image/')) {
        // Not a valid image, return 404
        return new NextResponse(null, { status: 404 });
      }
      const buffer = Buffer.from(await resp.arrayBuffer());
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': isOwner ? 'public, max-age=604800' : 'public, max-age=3600',
        },
      });
    } else {
      // Stream the file content (full-res)
      const fileRes = await drive.files.get({
        fileId,
        alt: 'media',
      }, { responseType: 'stream' });
      // Pipe the stream to a buffer
      const chunks: Buffer[] = [];
      await new Promise((resolve, reject) => {
        fileRes.data.on('data', (chunk: Buffer) => chunks.push(chunk));
        fileRes.data.on('end', resolve);
        fileRes.data.on('error', reject);
      });
      const buffer = Buffer.concat(chunks);
      // Try to get file metadata for content type
      let contentType = 'application/octet-stream';
      try {
        const meta = await drive.files.get({ fileId, fields: 'mimeType, name' });
        if (meta.data.mimeType) contentType = meta.data.mimeType;
      } catch {}
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': isOwner ? 'inline' : 'inline',
          'Cache-Control': isOwner ? 'public, max-age=604800' : 'public, max-age=3600',
        },
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch file from Google Drive', detail: e.message }, { status: 500 });
  }
}
