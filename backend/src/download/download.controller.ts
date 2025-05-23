import { Controller, Get, Query, Req, Res, UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Response, Request } from 'express';
import { PrismaService } from '../prisma.service';
import { decrypt } from '../lib/utils/crypto';
import { google } from 'googleapis';

function getDriveClientWithRefreshToken(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google',
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

@Controller('download/drive')
export class DownloadDriveController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getDriveFile(
    @Query('eventId') eventId: string,
    @Query('fileId') fileId: string,
    @Query('thumb') thumb: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!eventId || !fileId) {
      throw new NotFoundException('Missing eventId or fileId');
    }
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event || !event.authorRefreshToken) {
      throw new NotFoundException('Event or credentials not found');
    }
    const refreshToken = decrypt(event.authorRefreshToken);
    const drive = getDriveClientWithRefreshToken(refreshToken);
    // TODO: Implement JWT auth and check if user is owner
    const isOwner = false;
    try {
      if (thumb === '1') {
        const meta = await drive.files.get({ fileId, fields: 'thumbnailLink, mimeType' });
        const thumbnailLink = meta.data.thumbnailLink;
        const mimeType = meta.data.mimeType || '';
        if (!thumbnailLink || (!mimeType.startsWith('image/') && !mimeType.startsWith('video/'))) {
          throw new NotFoundException();
        }
        const resp = await fetch(thumbnailLink);
        const contentType = resp.headers.get('content-type') || 'image/jpeg';
        if (!contentType.startsWith('image/')) {
          throw new NotFoundException();
        }
        const buffer = Buffer.from(await resp.arrayBuffer());
        res.set({
          'Content-Type': contentType,
          'Cache-Control': isOwner ? 'public, max-age=604800' : 'public, max-age=3600',
        });
        return res.send(buffer);
      } else {
        const fileRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
        const chunks: Buffer[] = [];
        await new Promise((resolve, reject) => {
          fileRes.data.on('data', (chunk: Buffer) => chunks.push(chunk));
          fileRes.data.on('end', resolve);
          fileRes.data.on('error', reject);
        });
        const buffer = Buffer.concat(chunks);
        let contentType = 'application/octet-stream';
        try {
          const meta = await drive.files.get({ fileId, fields: 'mimeType, name' });
          if (meta.data.mimeType) contentType = meta.data.mimeType;
        } catch {}
        res.set({
          'Content-Type': contentType,
          'Content-Disposition': isOwner ? 'inline' : 'inline',
          'Cache-Control': isOwner ? 'public, max-age=604800' : 'public, max-age=3600',
        });
        return res.send(buffer);
      }
    } catch (e: any) {
      throw new InternalServerErrorException({ error: 'Failed to fetch file from Google Drive', detail: e.message });
    }
  }
}
