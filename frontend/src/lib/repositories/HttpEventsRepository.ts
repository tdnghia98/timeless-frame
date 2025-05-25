import { Event } from '@wedmemory/shared-types';
import { backendHttpClient } from '../utils/backendHttpClient';
import { IEventsRepository } from './IEventsRepository';

export class HttpEventsRepository implements IEventsRepository {
  getEventById(id: string): Promise<Event | null> {
    return backendHttpClient.get<Event | null>(`/events/${id}`);
  }
  getEventsByUser(userId: string): Promise<Event[] | null> {
    return backendHttpClient.get<Event[]>(`/events?userId=${userId}`);
  }
  updateEvent(id: string, data: Partial<Event>): Promise<Event | null> {
    return backendHttpClient.put<Event>(`/events/${id}`, data);
  }
  deleteEvent(id: string): Promise<void> {
    return backendHttpClient.delete<void>(`/events/${id}`);
  }
  async getEvents(): Promise<Event[]> {
    return backendHttpClient.get<Event[]>(`/events`);
  }
  async createEvent(event: Event): Promise<Event> {
    return backendHttpClient.post<Event>(`/events`, event);
  }
}
