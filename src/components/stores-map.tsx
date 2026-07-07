"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Phone } from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { NearbyStore } from "@/lib/stores/queries";

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
  popupAnchor: [0, -32],
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
        click: () => {
          map.panTo([store.latitude, store.longitude], { animate: true });
        },
      }}
    >
      {/* autoPan off: Leaflet's default "just enough to fit the popup" pan
          would otherwise run after our panTo and nudge the view again,
          leaving the marker slightly off-center. */}
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
