import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PrismaService } from '../prisma.service';
import { decrypt, isInvalidGrantError } from '../lib/utils/crypto';
import { emailer } from '../lib/utils/emailer';
import { uploadFileToDrive } from '../lib/utils/google-drive';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async createUpload(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.is('multipart/form-data')) {
        return res
          .status(400)
          .json({ error: 'Content-Type must be multipart/form-data' });
      }
      const formData = req.body;
      const eventId = formData.eventId;
      const guestName = formData.name;
      const guestEmail = formData.email;
      const file = formData.file;
      if (!eventId || !file) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      // TODO: JWT session check
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });
      if (!event || !event.folderId || !event.authorRefreshToken) {
        return res
          .status(404)
          .json({ error: 'Event folder or author credentials not found' });
      }
      const decryptedRefreshToken = decrypt(event.authorRefreshToken);
      let driveFile: any = null;
      try {
        driveFile = await uploadFileToDrive(
          '',
          decryptedRefreshToken,
          file,
          event.folderId,
        );
      } catch (error: any) {
        if (isInvalidGrantError(error)) {
          await emailer.sendMail({
            to: event.userId,
            subject: 'Action Required: Reconnect your Google Drive to WedMemory',

            text: `Hi!\n\nYour Google Drive connection for event '${event.title}' has expired or been revoked. Please sign in to WedMemory and reconnect your Google account to continue receiving uploads from your guests.\n\nThank you!`,
          });
          return res.status(500).json({
            error:
              "The event owner's Google Drive connection has expired. Please contact the event owner to reconnect their account.",
          });
        }
        throw error;
      }
      if (!driveFile) {
        return res
          .status(500)
          .json({ error: 'Failed to upload file to Google Drive' });
      }
      const uploadedBy = guestName || guestEmail || 'Anonymous Guest';
      const newUpload = await this.prisma.upload.create({
        data: {
          eventId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileId: driveFile.id,
          thumbnailUrl: driveFile.thumbnailLink,
          downloadUrl: driveFile.webContentLink,
          uploadedBy,
          status: 'pending',
        },
      });
      return res.status(201).json(newUpload);
    } catch (error) {
      console.error('Error handling upload:', error);
      return res.status(500).json({ error: 'Failed to process upload' });
    }
  }

  @Get()
  async getUploads(
    @Query('eventId') eventId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }
      // TODO: JWT session check
      const eventUploads = await this.prisma.upload.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(eventUploads);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      return res.status(500).json({ error: 'Failed to fetch uploads' });
    }
  }
}
