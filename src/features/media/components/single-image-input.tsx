"use client";

import { ImageUploader } from "./image-uploader";

/** ImageUploader adapter for a single-URL field (cover image, avatar, hero). */
export function SingleImageInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  return (
    <ImageUploader
      images={value ? [{ url: value }] : []}
      onChange={(images) => onChange(images.at(-1)?.url ?? "")}
    />
  );
}
