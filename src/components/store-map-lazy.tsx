"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, so it can only run on the client.
// This wrapper is the one place that's allowed to disable SSR for it, since
// `next/dynamic(..., { ssr: false })` requires a Client Component boundary —
// Server Component pages just render <StoreMapLazy /> like any other JSX.
export const StoreMapLazy = dynamic(
  () => import("@/components/store-map").then((mod) => mod.StoreMap),
  { ssr: false }
);
