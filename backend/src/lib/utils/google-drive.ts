import { google } from 'googleapis';
import { GoogleDriveFile } from '../types';
import { Readable } from 'stream';

// Create a new OAuth2 client using the access token
const createDriveClient = (accessToken: string, refreshToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
  );
  if (!refreshToken) {
    console.error('[Google Drive] No refresh token found. This may cause invalid_grant errors.');
  }
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.drive({ version: 'v3', auth: oauth2Client });
};

// Create a new folder in Google Drive
export async function createDriveFolder(accessToken: string, refreshToken: string, folderName: string): Promise<string | null> {
  try {
    const drive = createDriveClient(accessToken, refreshToken);
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
  accessToken: string, 
  refreshToken: string, 
  file: File, 
  folderId: string
): Promise<GoogleDriveFile | null> {
  try {
    const drive = createDriveClient(accessToken, refreshToken);
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
  accessToken: string, 
  refreshToken: string, 
  folderId: string
): Promise<GoogleDriveFile[]> {
  try {
    const drive = createDriveClient(accessToken, refreshToken);
    
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
export async function deleteFileFromDrive(accessToken: string, refreshToken: string, fileId: string): Promise<boolean> {
  try {
    const drive = createDriveClient(accessToken, refreshToken);
    
    await drive.files.delete({
      fileId: fileId,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}