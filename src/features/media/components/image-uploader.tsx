"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { GripVertical, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getListingUploadSignature, type UploadSignature } from "../server/actions";

export interface UploaderImage {
  url: string;
  alt?: string;
}

async function uploadToCloudinary(file: File, sig: UploadSignature): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  if (!res.ok) throw new Error("Upload failed");
  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: UploaderImage[];
  onChange: (images: UploaderImage[]) => void;
}) {
  const [mode, setMode] = React.useState<"checking" | "cloudinary" | "manual">(
    "checking",
  );
  const [uploading, setUploading] = React.useState(false);
  const [manualUrl, setManualUrl] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    getListingUploadSignature().then((result) => {
      setMode(result.ok ? "cloudinary" : "manual");
    });
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const next: UploaderImage[] = [...images];
      for (const file of Array.from(files)) {
        const sigResult = await getListingUploadSignature();
        if (!sigResult.ok) {
          toast.error(sigResult.error);
          setMode("manual");
          break;
        }
        const url = await uploadToCloudinary(file, sigResult.data);
        next.push({ url });
      }
      onChange(next);
    } catch {
      toast.error("Couldn't upload one or more images — please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid image URL.");
      return;
    }
    onChange([...images, { url }]);
    setManualUrl("");
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.url + i}
              className="border-line bg-surface-2 group relative aspect-4/3 overflow-hidden rounded-lg border"
            >
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                fill
                className="object-cover"
                unoptimized
              />
              {i === 0 && (
                <span className="bg-brand-900 absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove photo"
                className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
              <span className="absolute right-1.5 bottom-1.5 rounded-full bg-black/40 p-1 text-white">
                <GripVertical className="size-3.5" />
              </span>
            </div>
          ))}
        </div>
      )}

      {mode === "cloudinary" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {uploading ? "Uploading…" : "Upload photos"}
          </Button>
        </div>
      )}

      {mode === "manual" && (
        <div className="flex gap-2">
          <Input
            placeholder="https://images.example.com/photo.jpg"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addManualUrl();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addManualUrl}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      )}

      <p className="text-ink-500 text-xs">
        First photo is used as the cover image. {images.length}/20 added.
      </p>
    </div>
  );
}
