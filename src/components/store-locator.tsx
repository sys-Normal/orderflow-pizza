"use client";

import { useEffect, useState } from "react";
import { StoresMapLazy } from "@/components/stores-map-lazy";
import { fetchNearbyStores } from "@/lib/stores/actions";
import { Spinner } from "@/components/spinner";
import type { NearbyStore } from "@/lib/stores/queries";

type LocationStatus =
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported"
  | "error";

function isGeolocationSupported() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function StoreLocator() {
  const [status, setStatus] = useState<LocationStatus>(() =>
    isGeolocationSupported() ? "requesting" : "unsupported"
  );
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [stores, setStores] = useState<NearbyStore[] | null>(null);

  // Kicks off the actual permission prompt whenever status flips back to
  // "requesting" (on mount, and when the user clicks the retry button).
  // All state updates here happen inside getCurrentPosition's callbacks, not
  // synchronously in the effect body itself.
  useEffect(() => {
    if (status !== "requesting") return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("granted");
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [status]);

  useEffect(() => {
    if (status !== "granted" || !coords) return;
    let cancelled = false;
    fetchNearbyStores(coords.latitude, coords.longitude).then((result) => {
      if (!cancelled) setStores(result);
    });
    return () => {
      cancelled = true;
    };
  }, [status, coords]);

  if (status === "requesting") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-black/[.08] bg-surface p-8 dark:border-white/[.145]">
        <Spinner className="h-6 w-6 text-primary" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          위치 확인 중...
        </p>
      </div>
    );
  }

  if (status === "denied" || status === "unsupported" || status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-black/[.08] bg-surface p-8 text-center dark:border-white/[.145]">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {status === "unsupported"
            ? "이 브라우저에서는 위치 정보를 사용할 수 없습니다."
            : "주변 매장을 보려면 위치 권한을 허용해주세요."}
        </p>
        {status !== "unsupported" && (
          <button
            type="button"
            onClick={() => setStatus("requesting")}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            위치 권한 허용
          </button>
        )}
      </div>
    );
  }

  if (!coords) return null;

  return (
    <div className="flex flex-col gap-4">
      <StoresMapLazy center={coords} stores={stores ?? []} className="h-96 w-full" />
      {stores === null ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          주변 매장을 찾는 중...
        </p>
      ) : stores.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          반경 3km 이내에 매장이 없습니다.
        </p>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          반경 3km 이내 매장 {stores.length}곳 — 마커를 눌러 매장 정보를 확인하세요.
        </p>
      )}
    </div>
  );
}
