import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Every user uploads into their own folder, so ownership of an asset can be
// verified from its public_id alone.
export const userVideoFolder = (userId: string) => `video-uploads/${userId}`;

// Incoming transformation applied once at upload time (compression).
export const VIDEO_INCOMING_TRANSFORMATION = "q_auto,f_mp4";
