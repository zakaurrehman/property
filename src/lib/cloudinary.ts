import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

/** Signs a direct-to-Cloudinary browser upload so the API secret never reaches the client. */
export function signUploadParams(folder: string) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured — set CLOUDINARY_* env vars.");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.CLOUDINARY_API_SECRET!,
  );

  return {
    timestamp,
    signature,
    folder,
    apiKey: env.CLOUDINARY_API_KEY!,
    cloudName: env.CLOUDINARY_CLOUD_NAME!,
  };
}
