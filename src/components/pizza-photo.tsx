"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { PizzaIcon } from "@/components/icons";

export function PizzaPhoto({
  imageUrl,
  alt,
  aspectClassName,
  sizes,
  lightbox = true,
}: {
  imageUrl?: string | null;
  alt: string;
  aspectClassName: string;
  sizes: string;
  /** Card-grid thumbnails are just a browsing preview, not a "view this
   * closely" affordance, so the list can opt out of the click-to-zoom
   * lightbox while the detail modal keeps it. */
  lightbox?: boolean;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  if (!imageUrl) {
    return (
      <div
        className={`flex ${aspectClassName} items-center justify-center bg-primary/10 text-primary`}
      >
        <PizzaIcon className="h-16 w-16" />
      </div>
    );
  }

  const photo = (
    <>
      <Image src={imageUrl} alt={alt} fill sizes={sizes} className="object-cover" />
      {/* Source photos vary a lot in exposure/saturation — a flat dark
          layer keeps them visually consistent and less harsh next to the
          muted card UI, regardless of theme. */}
      <div className="absolute inset-0 bg-black/15" />
    </>
  );

  return (
    <>
      {lightbox ? (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`${alt} 원본 사진 크게 보기`}
          className={`relative block w-full !cursor-zoom-in ${aspectClassName} overflow-hidden bg-primary/10`}
        >
          {photo}
        </button>
      ) : (
        <div className={`relative w-full ${aspectClassName} overflow-hidden bg-primary/10`}>
          {photo}
        </div>
      )}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="닫기"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Plain <img>, not next/image: this is the one place the
              unfiltered original should render at its natural size instead
              of a fixed, optimizer-resized box. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
