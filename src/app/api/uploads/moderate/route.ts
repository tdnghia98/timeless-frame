import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from '@/lib/utils/prisma';

export async function POST(req: NextRequest) {
  try {
    const { uploadId, action } = await req.json();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!uploadId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    let result;
    if (action === "approve") {
      result = await prisma.upload.update({ where: { id: uploadId }, data: { status: "approved" } });
    } else if (action === "reject") {
      result = await prisma.upload.update({ where: { id: uploadId }, data: { status: "rejected" } });
    } else if (action === "hide") {
      result = await prisma.upload.update({ where: { id: uploadId }, data: { status: "rejected" } });
    } else if (action === "delete") {
      result = await prisma.upload.delete({ where: { id: uploadId } });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error moderating upload:", error);
    return NextResponse.json({ error: "Failed to moderate upload" }, { status: 500 });
  }
}
