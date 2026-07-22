"use client";

import dynamic from "next/dynamic";

function MapSkeleton() {
  return (
    <div className="h-40 w-full animate-pulse rounded-lg bg-black/[.05] dark:bg-white/[.08]" />
  );
}

// Leaflet touches `window` at import time, so it can only run on the client.
// This wrapper is the one place that's allowed to disable SSR for it, since
// `next/dynamic(..., { ssr: false })` requires a Client Component boundary —
// Server Component pages just render <StoreMapLazy /> like any other JSX.
// `loading` reserves the same footprint as the real map so it doesn't pop in.
export const StoreMapLazy = dynamic(
  () => import("@/components/store-map").then((mod) => mod.StoreMap),
  { ssr: false, loading: MapSkeleton }
);
