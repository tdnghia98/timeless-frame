import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventFormData, User } from '../lib/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserData } from '../auth/user.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() data: EventFormData, @UserData() user: User) {
    try {
      return await this.eventsService.createEvent(data, user);
    } catch (error) {
      Logger.error('Error creating event', error);
      throw new HttpException(
        'Failed to create event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getEvents(@UserData() user: any) {
    try {
      return await this.eventsService.getEvents(user);
    } catch {
      throw new HttpException(
        'Failed to fetch events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getEventById(@Param('id') id: string, @UserData() user: any) {
    try {
      return await this.eventsService.getEventById(id, user);
    } catch (e) {
      throw new HttpException(
        e.message || 'Event not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() data: Partial<EventFormData>,
    @UserData() user: any,
  ) {
    try {
      return await this.eventsService.updateEvent(id, data, user);
    } catch (e) {
      throw new HttpException(
        e.message || 'Failed to update event',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string, @UserData() user: any) {
    try {
      return await this.eventsService.deleteEvent(id, user);
    } catch (e) {
      throw new HttpException(
        e.message || 'Failed to delete event',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
