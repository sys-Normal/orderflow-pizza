"use client";

import dynamic from "next/dynamic";

// See store-map-lazy.tsx — Leaflet needs `window`, so this must stay a
// Client Component boundary with SSR disabled.
export const StoresMapLazy = dynamic(
  () => import("@/components/stores-map").then((mod) => mod.StoresMap),
  { ssr: false }
);
