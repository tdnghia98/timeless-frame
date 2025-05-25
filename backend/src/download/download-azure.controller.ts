// import { Controller, Get, Query, Req, Res, NotFoundException, InternalServerErrorException } from '@nestjs/common';
// import { Response, Request } from 'express';
// import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } from '@azure/storage-blob';
// import { PrismaService } from '../prisma.service';

// const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
// const AZURE_CONTAINER = process.env.AZURE_CONTAINER!;
// const AZURE_BASE_URL = process.env.AZURE_BASE_URL || `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER}`;
// const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
// const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER);

// @Controller('download/azure')
// export class DownloadAzureController {
//   constructor(private readonly prisma: PrismaService) {}

//   @Get()
//   async getAzureFile(
//     @Query('eventId') eventId: string,
//     @Query('blobName') blobName: string,
//     @Query('thumb') thumb: string,
//     @Req() req: Request,
//     @Res() res: Response,
//   ) {
//     if (!eventId || !blobName) {
//       throw new NotFoundException('Missing eventId or blobName');
//     }
//     // Check if user is event owner (TODO: JWT auth)
//     const event = await this.prisma.event.findUnique({ where: { id: eventId } });
//     let isOwner = false;
//     // TODO: Use JWT auth to check if req.user?.email === event.userId
//     // Set expiry: 7 days for owner, 1 hour for public
//     const expiresOn = isOwner
//       ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//       : new Date(Date.now() + 60 * 60 * 1000);
//     let url = `${AZURE_BASE_URL}/${blobName}`;
//     try {
//       const sharedKeyCredential = new StorageSharedKeyCredential(
//         process.env.AZURE_STORAGE_ACCOUNT_NAME!,
//         process.env.AZURE_STORAGE_ACCOUNT_KEY!
//       );
//       const sasToken = generateBlobSASQueryParameters({
//         containerName: AZURE_CONTAINER,
//         blobName,
//         permissions: BlobSASPermissions.parse('r'),
//         startsOn: new Date(),
//         expiresOn,
//         protocol: SASProtocol.Https,
//       }, sharedKeyCredential).toString();
//       url = `${url}?${sasToken}`;
//     } catch (e) {
//       throw new InternalServerErrorException('Failed to generate SAS URL');
//     }
//     return res.redirect(url);
//   }
// }
