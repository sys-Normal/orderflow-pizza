"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
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
        <Marker
          key={store.id}
          position={[store.latitude, store.longitude]}
          icon={storeMarkerIcon}
        >
          <Popup>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{store.name}</p>
              <p className="text-sm">{store.phone}</p>
              <Link
                href={`/menu?storeId=${store.id}`}
                className="mt-1 inline-block rounded-full bg-primary px-3 py-1 text-center text-sm font-medium text-primary-foreground"
              >
                주문하기
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
