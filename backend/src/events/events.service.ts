import { Inject, Injectable } from '@nestjs/common';
import { IEventRepository } from './event.repository';
import { EventFormData, User } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    @Inject(IEventRepository)
    private readonly eventRepository: IEventRepository,
  ) {}

  async createEvent(data: EventFormData, user: User) {
    const eventId = uuidv4();
    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/events/${eventId}`;
    const qrCode = await QRCode.toDataURL(shareUrl);
    // For now, skip folder creation and token encryption
    const eventCreateInput: Prisma.EventCreateInput = {
      id: eventId,
      title: data.title,
      description: data.description,
      theme: data.theme ?? null,
      date: new Date(data.date),
      user: {
        connect: { email: user.email },
      },
      folderId: '',
      shareUrl,
      qrCode,
      storageProvider: data.storageProvider || 'gdrive',
      authorRefreshToken: data.authorRefreshToken || '',
      uploads: { create: [] },
    };
    return this.eventRepository.createEvent(eventCreateInput);
  }

  async getEvents(user: any) {
    return this.eventRepository.getEventsByUser(user?.email || '');
  }

  async getEventById(eventId: string, user: any) {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event || event.userEmail !== user?.email) {
      throw new Error('Event not found or unauthorized');
    }
    return event;
  }

  async updateEvent(eventId: string, data: Partial<EventFormData>, user: any) {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event || event.userEmail !== user?.email) {
      throw new Error('Event not found or unauthorized');
    }
    // Only allow updating certain fields
    return this.eventRepository.updateEvent(eventId, {
      title: data.title ?? event.title,
      description: data.description ?? event.description,
      date: data.date ? new Date(data.date) : event.date,
      theme: data.theme ?? event.theme,
    });
  }

  async deleteEvent(eventId: string, user: any) {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event || event.userEmail !== user?.email) {
      throw new Error('Event not found or unauthorized');
    }
    await this.eventRepository.deleteEvent(eventId);
    return { success: true };
  }
}
