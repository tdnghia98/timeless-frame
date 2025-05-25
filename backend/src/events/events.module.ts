import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma.service';
import { IEventRepository } from './event.repository';
import { PrismaEventRepository } from './prisma-event.repository';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    PrismaService,
    { provide: IEventRepository, useClass: PrismaEventRepository },
  ],
  exports: [EventsService],
})
export class EventsModule {}
