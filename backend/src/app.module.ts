import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
