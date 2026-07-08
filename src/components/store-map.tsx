"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Hand-drawn pin (circle + triangle, no external icon assets) so we don't
// have to fight Next.js's static asset handling for Leaflet's default marker
// images. Colors use our CSS variables so it matches light/dark theme.
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

export function StoreMap({
  latitude,
  longitude,
  name,
  className = "h-64 w-full",
}: {
  latitude: number;
  longitude: number;
  name: string;
  className?: string;
}) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={true}
      className={`${className} rounded-lg`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={storeMarkerIcon}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}
