import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Event, Prisma } from '@prisma/client';
import { IEventRepository } from './event.repository';

@Injectable()
export class PrismaEventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: Prisma.EventCreateInput): Promise<Event> {
    return this.prisma.event.create({ data });
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({ where: { id } });
  }

  async getEventsByUser(userEmail: string): Promise<Event[]> {
    return this.prisma.event.findMany({ where: { userEmail } });
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    return this.prisma.event.update({ where: { id }, data });
  }

  async deleteEvent(id: string): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }
}
