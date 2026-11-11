import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const video = await prisma.video.findUnique({ where: { id: params.id } });
  // Same response for "missing" and "not yours" so ids can't be probed.
  if (!video || video.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });
    await prisma.video.delete({ where: { id: video.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete video failed", error);
    return NextResponse.json({ error: "Could not delete video" }, { status: 500 });
  }
}
