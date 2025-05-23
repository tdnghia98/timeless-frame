import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import { uploadFileToDriveWithRefreshToken } from "@/lib/utils/google-drive";
import { prisma } from '@/lib/utils/prisma';
import { decrypt, isInvalidGrantError } from "@/lib/utils/crypto";
import { emailer } from "@/lib/utils/emailer";

// Create a new upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const eventId = formData.get("eventId") as string;
    const guestName = formData.get("name") as string;
    const guestEmail = formData.get("email") as string;
    const file = formData.get("file") as File;
    
    // Validate request data
    if (!eventId || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // For guest uploads, we need to find the event and the owner's session
    // For MVP, we're using mock data. In a real app, you would:
    // 1. Look up the event in the database
    // 2. Get the event owner's credentials
    // 3. Use those credentials to upload to their Google Drive
    
    // For this MVP, we'll assume the event exists and the current session is the owner's
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Upload failed. Could not authenticate with Google Drive." },
        { status: 401 }
      );
    }
    // Look up the event by eventId using Prisma
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || !event.folderId || !event.authorRefreshToken) {
      return NextResponse.json(
        { error: "Event folder or author credentials not found" },
        { status: 404 }
      );
    }
    // Upload file to Google Drive using the event author's refresh token
    const decryptedRefreshToken = decrypt(event.authorRefreshToken);
    let driveFile: any = null;
    try {
      driveFile = await uploadFileToDriveWithRefreshToken(decryptedRefreshToken, file, event.folderId);
    } catch (error: any) {
      if (isInvalidGrantError(error)) {
        // Send real email notification to event owner
        await emailer.sendMail({
          to: event.userId,
          subject: "Action Required: Reconnect your Google Drive to WedMemory",
          text: `Hi!\n\nYour Google Drive connection for event '${event.title}' has expired or been revoked. Please sign in to WedMemory and reconnect your Google account to continue receiving uploads from your guests.\n\nThank you!`,
        });
        return NextResponse.json(
          { error: "The event owner's Google Drive connection has expired. Please contact the event owner to reconnect their account." },
          { status: 500 }
        );
      }
      throw error;
    }
    if (!driveFile) {
      return NextResponse.json(
        { error: "Failed to upload file to Google Drive" },
        { status: 500 }
      );
    }
    // Create upload record in the database
    const uploadedBy = guestName || guestEmail || session.user?.name || session.user?.email || "Anonymous Guest";
    const newUpload = await prisma.upload.create({
      data: {
        eventId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileId: driveFile.id,
        thumbnailUrl: driveFile.thumbnailLink,
        downloadUrl: driveFile.webContentLink,
        uploadedBy,
        status: 'pending',
      },
    });
    return NextResponse.json(newUpload, { status: 201 });
  } catch (error) {
    console.error("Error handling upload:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}

// Get all uploads for a specific event
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Fetch uploads from the database
    const eventUploads = await prisma.upload.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(eventUploads);
  } catch (error) {
    console.error("Error fetching uploads:", error);
    return NextResponse.json(
      { error: "Failed to fetch uploads" },
      { status: 500 }
    );
  }
}