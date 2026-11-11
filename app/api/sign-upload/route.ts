import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  cloudinary,
  userVideoFolder,
  VIDEO_INCOMING_TRANSFORMATION,
} from "@/lib/cloudinary";

// Returns a short-lived signature so the browser can upload straight to
// Cloudinary. The file never passes through our server, which avoids the
// serverless request-body limit (~4.5 MB on Vercel).
export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder: userVideoFolder(userId),
    transformation: VIDEO_INCOMING_TRANSFORMATION,
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return NextResponse.json({ ...paramsToSign, signature, apiKey, cloudName });
}
