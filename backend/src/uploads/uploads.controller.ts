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
import type {
  Upload,
  UploadsGetResponse,
  UploadCreateResponse,
  UploadErrorResponse,
} from '@wedmemory/shared';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async createUpload(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      if (!req.is('multipart/form-data')) {
        res.status(400).json({
          error: 'Content-Type must be multipart/form-data',
        } as UploadErrorResponse);
        return;
      }
      const formData = req.body;
      const eventId = formData.eventId;
      const guestName = formData.name;
      const guestEmail = formData.email;
      const file = formData.file;
      if (!eventId || !file) {
        res.status(400).json({
          error: 'Missing required fields',
        } as UploadErrorResponse);
        return;
      }
      // TODO: JWT session check
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });
      if (!event || !event.folderId || !event.authorRefreshToken) {
        res.status(404).json({
          error: 'Event folder or author credentials not found',
        });
        return;
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
            to: event.userEmail,
            subject:
              'Action Required: Reconnect your Google Drive to WedMemory',
            text: `Hi!\n\nYour Google Drive connection for event '${event.title}' has expired or been revoked. Please sign in to WedMemory and reconnect your Google account to continue receiving uploads from your guests.\n\nThank you!`,
          });
          res.status(500).json({
            error:
              "The event owner's Google Drive connection has expired. Please contact the event owner to reconnect their account.",
          } as UploadErrorResponse);
          return;
        }
        throw error;
      }
      if (!driveFile) {
        res.status(500).json({
          error: 'Failed to upload file to Google Drive',
        } as UploadErrorResponse);
        return;
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
      // Convert createdAt to ISO string and status to correct type
      const uploadResponse: Upload = {
        ...newUpload,
        createdAt:
          newUpload.createdAt instanceof Date
            ? newUpload.createdAt.toISOString()
            : newUpload.createdAt,
        status: newUpload.status as 'pending' | 'approved' | 'rejected',
      };
      res.status(201).json(uploadResponse as UploadCreateResponse);
      return;
    } catch (error) {
      console.error('Error handling upload:', error);
      res.status(500).json({
        error: 'Failed to process upload',
      } as UploadErrorResponse);
      return;
    }
  }

  @Get()
  async getUploads(
    @Query('eventId') eventId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      if (!eventId) {
        res.status(400).json({
          error: 'Event ID is required',
        } as UploadErrorResponse);
        return;
      }
      const eventUploadsRaw = await this.prisma.upload.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
      });
      // Convert createdAt to ISO string and status to correct type for all uploads
      const eventUploads: UploadsGetResponse = eventUploadsRaw.map((u) => ({
        ...u,
        createdAt:
          u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
        status: u.status as 'pending' | 'approved' | 'rejected',
      }));
      res.json(eventUploads);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      res.status(500).json({
        error: 'Failed to fetch uploads',
      } as UploadErrorResponse);
    }
  }
}
