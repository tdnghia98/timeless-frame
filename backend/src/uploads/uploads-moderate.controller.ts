import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('uploads/moderate')
@UseGuards(JwtAuthGuard)
export class UploadsModerateController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async moderateUpload(@Req() req: Request, @Res() res: Response) {
    try {
      const { uploadId, action } = req.body;
      // TODO: JWT session check
      if (!uploadId || !action) {
        return res.status(400).json({ error: 'Missing parameters' });
      }
      let result;
      if (action === 'approve') {
        result = await this.prisma.upload.update({
          where: { id: uploadId },
          data: { status: 'approved' },
        });
      } else if (action === 'reject' || action === 'hide') {
        result = await this.prisma.upload.update({
          where: { id: uploadId },
          data: { status: 'rejected' },
        });
      } else if (action === 'delete') {
        result = await this.prisma.upload.delete({ where: { id: uploadId } });
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
      return res.json({ success: true, result });
    } catch (error) {
      console.error('Error moderating upload:', error);
      return res.status(500).json({ error: 'Failed to moderate upload' });
    }
  }
}
