"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Same hand-drawn pin as store-map.tsx, kept as a separate copy rather than
// a shared import so this picker doesn't pull in that file's Popup-specific
// styling assumptions.
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
});

type LatLng = { latitude: number; longitude: number };

function ClickHandler({ onChange }: { onChange: (position: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

// Recenters the map when `position` changes from outside a map click (e.g.
// an address search result) — a plain click-driven update already has the
// map centered there, so this just re-affirms it in that case.
function Recenter({ position }: { position: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([position.latitude, position.longitude], map.getZoom());
    // Only the coordinates should trigger a recenter, not zoom changes the
    // user makes by scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.latitude, position.longitude]);
  return null;
}

export function StoreLocationPickerMap({
  position,
  onChange,
  className = "h-64 w-full",
}: {
  position: LatLng;
  onChange: (position: LatLng) => void;
  className?: string;
}) {
  return (
    <MapContainer
      center={[position.latitude, position.longitude]}
      zoom={18}
      scrollWheelZoom={true}
      className={`${className} rounded-lg`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[position.latitude, position.longitude]} icon={storeMarkerIcon} />
      <ClickHandler onChange={onChange} />
      <Recenter position={position} />
    </MapContainer>
  );
}
