import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { cloudinary, userVideoFolder } from "@/lib/cloudinary";

// List only the signed-in user's videos.
export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Fetch videos failed", error);
    return NextResponse.json({ error: "Error fetching videos" }, { status: 500 });
  }
}

// Save metadata after the browser has uploaded the file to Cloudinary.
// Size and duration are read back from Cloudinary, never trusted from the client.
export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const publicId = typeof body.publicId === "string" ? body.publicId : "";
    const originalSize = Number(body.originalSize);

    if (!title || title.length > 120) {
      return NextResponse.json({ error: "Title is required (max 120 chars)" }, { status: 400 });
    }
    if (description.length > 1000) {
      return NextResponse.json({ error: "Description too long" }, { status: 400 });
    }
    if (!Number.isFinite(originalSize) || originalSize <= 0) {
      return NextResponse.json({ error: "Invalid originalSize" }, { status: 400 });
    }
    // The asset must live in this user's own folder.
    if (!publicId.startsWith(`${userVideoFolder(userId)}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const asset = await cloudinary.api.resource(publicId, {
      resource_type: "video",
    });

    const video = await prisma.video.create({
      data: {
        userId,
        title,
        description,
        publicId,
        originalSize: String(originalSize),
        compressedSize: String(asset.bytes),
        duration: asset.duration ?? 0,
      },
    });
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Create video failed", error);
    return NextResponse.json({ error: "Could not save video" }, { status: 500 });
  }
}
