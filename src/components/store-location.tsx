"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { StoreMapLazy } from "@/components/store-map-lazy";

export function StoreLocation({
  address,
  latitude,
  longitude,
  name,
}: {
  address: string;
  latitude: number;
  longitude: number;
  name: string;
}) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{address}</p>
        <button
          type="button"
          onClick={() => setShowMap((prev) => !prev)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-black/[.08] px-2 py-0.5 text-xs font-medium dark:border-white/[.145]"
        >
          {showMap ? "지도 숨기기" : "지도보기"}
          <Globe className="h-3 w-3" />
        </button>
      </div>
      {showMap && (
        <StoreMapLazy
          latitude={latitude}
          longitude={longitude}
          name={name}
          className="h-40 w-full"
        />
      )}
    </div>
  );
}
