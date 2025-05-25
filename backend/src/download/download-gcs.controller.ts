// import { Controller, Get, Query, Req, Res, NotFoundException, InternalServerErrorException } from '@nestjs/common';
// import { Response, Request } from 'express';
// import { Storage } from '@google-cloud/storage';
// import { PrismaService } from '../prisma.service';

// const GCS_BUCKET = process.env.GCS_BUCKET!;
// const GCS_BASE_URL = process.env.GCS_BASE_URL || `https://storage.googleapis.com/${GCS_BUCKET}`;
// const storage = new Storage({
//   projectId: process.env.GCS_PROJECT_ID,
//   credentials: process.env.GCS_CREDENTIALS ? JSON.parse(process.env.GCS_CREDENTIALS) : undefined,
// });
// const bucket = storage.bucket(GCS_BUCKET);

// @Controller('download/gcs')
// export class DownloadGcsController {
//   constructor(private readonly prisma: PrismaService) {}

//   @Get()
//   async getGcsFile(
//     @Query('eventId') eventId: string,
//     @Query('gcsKey') gcsKey: string,
//     @Query('thumb') thumb: string,
//     @Req() req: Request,
//     @Res() res: Response,
//   ) {
//     if (!eventId || !gcsKey) {
//       throw new NotFoundException('Missing eventId or gcsKey');
//     }
//     // Check if user is event owner (TODO: JWT auth)
//     const event = await this.prisma.event.findUnique({ where: { id: eventId } });
//     let isOwner = false;
//     // TODO: Use JWT auth to check if req.user?.email === event.userId
//     // For now, always public
//     // Set expiry: 7 days for owner, 1 hour for public
//     const expires = Date.now() + (isOwner ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000); // ms
//     let url = `${GCS_BASE_URL}/${gcsKey}`;
//     try {
//       const file = bucket.file(gcsKey);
//       [url] = await file.getSignedUrl({
//         action: 'read',
//         expires,
//       });
//     } catch (e) {
//       throw new InternalServerErrorException('Failed to generate GCS signed URL');
//     }
//     return res.redirect(url);
//   }
// }
