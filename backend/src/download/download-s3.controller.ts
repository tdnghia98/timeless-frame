// import { Controller, Get, Query, Req, Res, NotFoundException, InternalServerErrorException } from '@nestjs/common';
// import { Response, Request } from 'express';
// import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { PrismaService } from '../prisma.service';

// const S3_BUCKET = process.env.AWS_S3_BUCKET!;
// const S3_REGION = process.env.AWS_S3_REGION!;
// const s3 = new S3Client({
//   region: S3_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// @Controller('download/s3')
// export class DownloadS3Controller {
//   constructor(private readonly prisma: PrismaService) {}

//   @Get()
//   async getS3File(
//     @Query('eventId') eventId: string,
//     @Query('s3Key') s3Key: string,
//     @Query('thumb') thumb: string,
//     @Req() req: Request,
//     @Res() res: Response,
//   ) {
//     if (!eventId || !s3Key) {
//       throw new NotFoundException('Missing eventId or s3Key');
//     }
//     // Check if user is event owner (TODO: JWT auth)
//     const event = await this.prisma.event.findUnique({ where: { id: eventId } });
//     let isOwner = false;
//     // TODO: Use JWT auth to check if req.user?.email === event.userId
//     // Set expiry: 7 days for owner, 1 hour for public
//     const expiresIn = isOwner ? 60 * 60 * 24 * 7 : 60 * 60; // seconds
//     let url = '';
//     try {
//       url = await getSignedUrl(s3, new GetObjectCommand({
//         Bucket: S3_BUCKET,
//         Key: s3Key,
//       }), { expiresIn });
//     } catch (e) {
//       throw new InternalServerErrorException('Failed to generate S3 signed URL');
//     }
//     return res.redirect(url);
//   }
// }
