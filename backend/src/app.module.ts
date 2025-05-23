import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { DownloadDriveController } from './download/download.controller';
import { DownloadGcsController } from './download/download-gcs.controller';
import { DownloadAzureController } from './download/download-azure.controller';
import { DownloadS3Controller } from './download/download-s3.controller';
import { DownloadLocalController } from './download/download-local.controller';
import { UploadsController } from './uploads/uploads.controller';
import { UploadsModerateController } from './uploads/uploads-moderate.controller';
import { StoragesController } from './storages/storages.controller';

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [AppController, DownloadDriveController, DownloadGcsController, DownloadAzureController, DownloadS3Controller, DownloadLocalController, UploadsController, UploadsModerateController, StoragesController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
