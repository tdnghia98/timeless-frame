import { google } from 'googleapis';
import { Session } from 'next-auth';
import { GoogleDriveFile } from '../types';
import { Readable } from 'stream';

// Create a new OAuth2 client using the access token
const createDriveClient = (session: Session) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/callback/google'
  );
  if (!session.refreshToken) {
    console.error('[Google Drive] No refresh token found in session. This may cause invalid_grant errors.');
  }
  oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
  return google.drive({ version: 'v3', auth: oauth2Client });
};

// Create a new folder in Google Drive
export async function createDriveFolder(session: Session, folderName: string): Promise<string | null> {
  try {
    const drive = createDriveClient(session);
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    
    const response = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });
    
    return response.data.id || null;
  } catch (error) {
    console.error('Error creating folder:', error);
    return null;
  }
}

// Upload a file to a specific folder in Google Drive
export async function uploadFileToDrive(
  session: Session, 
  file: File, 
  folderId: string
): Promise<GoogleDriveFile | null> {
  try {
    const drive = createDriveClient(session);
    // Convert the file to an array buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileMetadata = {
      name: file.name,
      parents: [folderId],
    };
    const media = {
      mimeType: file.type,
      body: Readable.from(buffer), // Use a stream here!
    };
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, mimeType, webContentLink, webViewLink, thumbnailLink, size',
    });
    return response.data as GoogleDriveFile;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

// Get files from a specific folder in Google Drive
export async function getFilesFromFolder(
  session: Session, 
  folderId: string
): Promise<GoogleDriveFile[]> {
  try {
    const drive = createDriveClient(session);
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType, webContentLink, webViewLink, thumbnailLink, size)',
    });
    
    return response.data.files as GoogleDriveFile[];
  } catch (error) {
    console.error('Error getting files:', error);
    return [];
  }
}

// Delete a file from Google Drive
export async function deleteFileFromDrive(session: Session, fileId: string): Promise<boolean> {
  try {
    const drive = createDriveClient(session);
    
    await drive.files.delete({
      fileId: fileId,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}