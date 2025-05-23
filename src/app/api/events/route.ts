import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { createDriveFolder } from "@/lib/utils/google-drive";
import { EventFormData } from "@/lib/types";
import { prisma } from '@/lib/utils/prisma';
import { encrypt } from "@/lib/utils/crypto";

// Create a new event
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const data: EventFormData = await req.json();
    // Validate request data
    if (!data.title || !data.description || !data.date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // Storage provider selection (default to 'gdrive' for now)
    // Accepts: 'gdrive', 'local', 's3', 'gcs', 'azure'
    const storageProvider = data.storageProvider || 'gdrive';

    // Create a folder in Google Drive
    const folderId = await createDriveFolder(session, `WedMemory - ${data.title}`);
    if (!folderId) {
      return NextResponse.json(
        { error: "Failed to create Google Drive folder" },
        { status: 500 }
      );
    }

    // Generate a unique event ID, share URL, and QR code
    const eventId = uuidv4();
    const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/events/${eventId}`;
    const qrCode = await QRCode.toDataURL(shareUrl);

    // Save the event author's refresh token (encrypted) if using Google Drive
    const authorRefreshToken = storageProvider === 'gdrive' && session.refreshToken ? encrypt(session.refreshToken) : undefined;

    // Create event in the database
    const newEvent = await prisma.event.create({
      data: {
        id: eventId,
        title: data.title,
        description: data.description,
        theme: data.theme,
        date: new Date(data.date),
        userId: session.user?.email || "",
        folderId,
        shareUrl,
        qrCode,
        authorRefreshToken,
        storageProvider, // Store the selected storage provider
      },
    });
    // TODO: In the future, implement a migration mechanism to move event files from one storage provider to another if the user changes their preference.

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// Get all events for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    if (eventId) {
      // Return single event for manage page
      const event = await prisma.event.findUnique({ where: { id: eventId, userId: session.user?.email || "" } });
      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      return NextResponse.json(event);
    }
    // Fetch events for the authenticated user from the database
    const userEvents = await prisma.event.findMany({
      where: { userId: session.user?.email || "" },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(userEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// Get a single event by eventId (for manage page)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const { eventId, title, description, date } = await req.json();
    if (!eventId || !title || !description || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const updated = await prisma.event.update({
      where: { id: eventId, userId: session.user?.email || "" },
      data: { title, description, date: new Date(date) },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// Get a single event by eventId (for manage page)
export async function HEAD(req: NextRequest) {
  // Not implemented
}

// Add a new route to return available storage providers based on env vars
export async function OPTIONS(req: NextRequest) {
  // This endpoint returns a list of available storage providers
  // based on which environment variables are set
  const availableProviders: { value: string; label: string }[] = [];
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    availableProviders.push({ value: 'gdrive', label: 'Google Drive' });
  }
  if (process.env.LOCAL_STORAGE_PATH) {
    availableProviders.push({ value: 'local', label: 'Local Disk' });
  }
  if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
    availableProviders.push({ value: 's3', label: 'Amazon S3' });
  }
  if (process.env.GCS_BUCKET && process.env.GCS_PROJECT_ID && process.env.GCS_CREDENTIALS) {
    availableProviders.push({ value: 'gcs', label: 'Google Cloud Storage' });
  }
  if (process.env.AZURE_STORAGE_CONNECTION_STRING && process.env.AZURE_CONTAINER) {
    availableProviders.push({ value: 'azure', label: 'Azure Blob Storage' });
  }
  return NextResponse.json({ providers: availableProviders });
}