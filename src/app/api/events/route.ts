import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { createDriveFolder } from "@/lib/utils/google-drive";
import { EventFormData } from "@/lib/types";

// Mock database for MVP (replace with a real database in production)
let events: any[] = [];

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

    // Create a folder in Google Drive
    const folderId = await createDriveFolder(session, `WedMemory - ${data.title}`);
    if (!folderId) {
      return NextResponse.json(
        { error: "Failed to create Google Drive folder" },
        { status: 500 }
      );
    }

    // Generate a unique event ID
    const eventId = uuidv4();

    // Generate share URL and QR code
    const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/events/${eventId}`;
    const qrCode = await QRCode.toDataURL(shareUrl);

    // Create event object
    const newEvent = {
      id: eventId,
      title: data.title,
      description: data.description,
      theme: data.theme,
      date: new Date(data.date),
      userId: session.user?.email || "",
      folderId,
      shareUrl,
      qrCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save event to database (mock for MVP)
    events.push(newEvent);

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

    // Filter events by user ID (email)
    const userEvents = events.filter(
      (event) => event.userId === session.user?.email
    );

    return NextResponse.json(userEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}