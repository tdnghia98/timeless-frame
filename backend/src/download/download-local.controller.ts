import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const UPLOADS_ROOT = process.env.LOCAL_UPLOADS_ROOT || path.resolve(process.cwd(), 'uploads');

@Controller('download/local')
export class DownloadLocalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getLocalFile(
    @Query('eventId') eventId: string,
    @Query('folderId') folderId: string,
    @Query('fileName') fileName: string,
    @Query('thumb') thumb: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!eventId || !fileName) {
      throw new NotFoundException('Missing eventId or fileName');
    }
    // Check if user is event owner (TODO: JWT auth)
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    // let isOwner = req.user?.email === event.userId; // TODO: enforce owner-only access if needed
    // Build file path
    const filePath = path.join(UPLOADS_ROOT, folderId || '', fileName);
    try {
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) throw new Error('Not a file');
      if (!existsSync(filePath)) throw new Error('File does not exist');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.setHeader('Content-Type', 'application/octet-stream');
      const stream = createReadStream(filePath);
      stream.pipe(res);
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}
