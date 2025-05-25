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
import { createDriveFolder } from '../lib/utils/google-drive';
import { decrypt } from '../lib/utils/crypto';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async createEvent(@Body() data: EventFormData, @UserData() user: User) {
    try {
      // Fetch the user from the database to get the encrypted refresh token
      const dbUser = await this.prisma.user.findUnique({
        where: { email: user.email },
      });
      if (!dbUser?.refreshToken) {
        throw new HttpException(
          'Google account not connected. Please sign in with Google.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const eventId = uuidv4();
      const decryptedRefreshToken = decrypt(dbUser.refreshToken);
      const folderName = data.title || 'WedMemory Event';
      const folderId = await createDriveFolder(
        '',
        decryptedRefreshToken,
        // Use eventId to ensure unique folder names
        `${folderName}_${eventId}`,
      );
      if (!folderId) {
        throw new HttpException(
          'Failed to create Google Drive folder',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      // Pass folderId to the event creation service
      return await this.eventsService.createEvent(
        eventId,
        data,
        user,
        folderId,
      );
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
