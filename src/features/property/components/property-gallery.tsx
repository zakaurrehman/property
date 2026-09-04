"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PropertyDetailData } from "../server/queries";

export function PropertyGallery({
  media,
  title,
}: {
  media: PropertyDetailData["media"];
  title: string;
}) {
  const photos = media.filter((m) => m.kind === "IMAGE");
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  if (photos.length === 0) {
    return <div className="bg-surface-2 aspect-16/9 w-full rounded-2xl" />;
  }

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="relative col-span-4 row-span-2 aspect-16/10 sm:col-span-2 sm:row-span-2"
        >
          <Image
            src={photos[0].url}
            alt={photos[0].alt ?? title}
            fill
            priority
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </button>
        {photos.slice(1, 5).map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => openAt(i + 1)}
            className="relative hidden aspect-square sm:block"
          >
            <Image
              src={photo.url}
              alt={photo.alt ?? title}
              fill
              sizes="25vw"
              className="object-cover"
            />
            {i === 3 && photos.length > 5 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                +{photos.length - 5} photos
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => openAt(0)}
        className="text-ink-600 hover:text-accent-600 mt-2 flex items-center gap-1.5 text-sm font-medium"
      >
        <Expand className="size-4" /> View all {photos.length} photos
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl border-none bg-black p-0"
        >
          <DialogTitle className="sr-only">
            {title} — photo {index + 1}
          </DialogTitle>
          <div className="relative aspect-16/10 w-full">
            <Image
              src={photos[index].url}
              alt={photos[index].alt ?? title}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => setIndex((i) => (i + 1) % photos.length)}
                className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {photos.map((p, i) => (
                  <span
                    key={p.id}
                    className={cn(
                      "size-1.5 rounded-full bg-white/40",
                      i === index && "bg-white",
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
