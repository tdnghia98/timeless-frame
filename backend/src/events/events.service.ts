import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventFormData } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(data: EventFormData, user: any) {
    const eventId = uuidv4();
    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/events/${eventId}`;
    const qrCode = await QRCode.toDataURL(shareUrl);
    // For now, skip folder creation and token encryption
    return this.prisma.event.create({
      data: {
        id: eventId,
        title: data.title,
        description: data.description,
        theme: data.theme,
        date: new Date(data.date),
        userId: user?.email || '',
        folderId: '',
        shareUrl,
        qrCode,
        authorRefreshToken: '',
        storageProvider: data.storageProvider || 'gdrive',
      },
    });
  }

  async getEvents(user: any) {
    return this.prisma.event.findMany({
      where: { userId: user?.email || '' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
