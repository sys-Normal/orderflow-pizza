"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Phone } from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { NearbyStore } from "@/lib/stores/queries";

// Must match the popupAnchor y-offset below — used again when centering the
// popup itself (see StoreMarker's popupopen handler).
const POPUP_ANCHOR_Y = 32;

const storeMarkerIcon = L.divIcon({
  html: `
    <svg viewBox="0 0 24 24" width="32" height="36">
      <circle cx="12" cy="9" r="7" fill="var(--primary)" />
      <path d="M6 13 L18 13 L12 22 Z" fill="var(--primary)" />
      <circle cx="12" cy="9" r="2.5" fill="var(--background)" />
    </svg>
  `,
  className: "",
  iconSize: [32, 36],
  iconAnchor: [16, 36],
  popupAnchor: [0, -POPUP_ANCHOR_Y],
});

const userMarkerIcon = L.divIcon({
  html: `
    <svg viewBox="0 0 24 24" width="20" height="20">
      <circle cx="12" cy="12" r="7" fill="#4285f4" stroke="white" stroke-width="3" />
    </svg>
  `,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function StoreMarker({ store }: { store: NearbyStore }) {
  const map = useMap();

  return (
    <Marker
      position={[store.latitude, store.longitude]}
      icon={storeMarkerIcon}
      eventHandlers={{
        // Center the popup bubble itself, not the marker underneath it —
        // centering on the marker left the (taller) popup sitting above
        // the middle of the screen with empty space below it. Runs on
        // popupopen (not click) so the popup's real rendered height is
        // available to measure.
        popupopen: (e) => {
          const popup = e.popup;
          // Reading layout right on popupopen can race the browser's layout
          // of the newly-inserted popup DOM — wait a frame so rects below
          // reflect where it's actually rendered.
          requestAnimationFrame(() => {
            const wrapper = popup
              .getElement()
              ?.querySelector<HTMLElement>(".leaflet-popup-content-wrapper");
            if (!wrapper) return;
            // Measure the actual on-screen gap between the popup's current
            // center and the map viewport's center, then nudge by exactly
            // that (rather than reconstructing it from icon/popup anchor
            // constants, which don't cleanly account for Leaflet's own
            // popup layout margins).
            const mapRect = map.getContainer().getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            const deltaY =
              mapRect.top + mapRect.height / 2 - (wrapperRect.top + wrapperRect.height / 2);
            map.panBy([0, -deltaY], { animate: true });
          });
        },
      }}
    >
      {/* autoPan off: Leaflet's default "just enough to fit the popup" pan
          would otherwise run right after and undo our own centering. */}
      <Popup minWidth={200} autoPan={false}>
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold leading-snug">{store.name}</p>
          <p className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {store.phone}
          </p>
          <Link
            href={`/menu?storeId=${store.id}`}
            className="mt-1 block rounded-full bg-primary px-3 py-1.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            주문하기
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}

export function StoresMap({
  center,
  stores,
  radiusKm = 3,
  className = "h-96 w-full",
}: {
  center: { latitude: number; longitude: number };
  stores: NearbyStore[];
  radiusKm?: number;
  className?: string;
}) {
  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={14}
      scrollWheelZoom={false}
      className={`${className} rounded-lg`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[center.latitude, center.longitude]}
        radius={radiusKm * 1000}
        pathOptions={{ color: "var(--primary)", fillOpacity: 0.05 }}
      />
      <Marker position={[center.latitude, center.longitude]} icon={userMarkerIcon} />
      {stores.map((store) => (
        <StoreMarker key={store.id} store={store} />
      ))}
    </MapContainer>
  );
}
