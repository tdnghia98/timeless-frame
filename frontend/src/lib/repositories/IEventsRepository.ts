import type { Event } from '@wedmemory/shared-types';

export interface IEventsRepository {
  getEvents(): Promise<Event[]>;
  createEvent(event: Event): Promise<Event>;
  getEventById(id: string): Promise<Event | null>;
  getEventsByUser(userId: string): Promise<Event[] | null>;
  updateEvent(id: string, data: Partial<Event>): Promise<Event | null>;
  deleteEvent(id: string): Promise<void>;
}
