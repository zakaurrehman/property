"use server";

import { requireAgent } from "@/lib/auth/guards";
import { isCloudinaryConfigured, signUploadParams } from "@/lib/cloudinary";
import type { ActionResult } from "@/types/action-result";

export interface UploadSignature {
  timestamp: number;
  signature: string;
  folder: string;
  apiKey: string;
  cloudName: string;
}

/** Signs a browser upload for the currently signed-in agent. Requires CLOUDINARY_* env vars. */
export async function getListingUploadSignature(): Promise<
  ActionResult<UploadSignature>
> {
  const { user } = await requireAgent();

  if (!isCloudinaryConfigured) {
    return {
      ok: false,
      error:
        "Cloudinary isn't configured on this environment — paste image URLs instead.",
    };
  }

  return { ok: true, data: signUploadParams(`estate-bureau/listings/${user.id}`) };
}
