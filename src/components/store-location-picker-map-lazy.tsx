"use client";

import dynamic from "next/dynamic";

function MapSkeleton() {
  return (
    <div className="h-64 w-full animate-pulse rounded-lg bg-black/[.05] dark:bg-white/[.08]" />
  );
}

// Same SSR-disabling wrapper pattern as store-map-lazy.tsx — Leaflet touches
// `window` at import time.
export const StoreLocationPickerMapLazy = dynamic(
  () =>
    import("@/components/store-location-picker-map").then(
      (mod) => mod.StoreLocationPickerMap
    ),
  { ssr: false, loading: MapSkeleton }
);
