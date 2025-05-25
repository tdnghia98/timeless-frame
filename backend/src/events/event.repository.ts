import { Event, Prisma } from '@prisma/client';

export interface IEventRepository {
  createEvent(data: Prisma.EventCreateInput): Promise<Event>;
  getEventById(id: string): Promise<Event | null>;
  getEventsByUser(userId: string): Promise<Event[]>;
  updateEvent(id: string, data: Partial<Event>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
}

export const IEventRepository = Symbol('IEventRepository');
