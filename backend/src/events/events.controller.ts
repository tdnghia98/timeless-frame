import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventFormData } from '../lib/types';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() data: EventFormData, @Req() req: any) {
    try {
      return await this.eventsService.createEvent(data, req.user);
    } catch {
      throw new HttpException(
        'Failed to create event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getEvents(@Req() req: any) {
    try {
      return await this.eventsService.getEvents(req.user);
    } catch {
      throw new HttpException(
        'Failed to fetch events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
