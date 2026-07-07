"use client";

import { useEffect, useState } from "react";
import { StoresMapLazy } from "@/components/stores-map-lazy";
import { fetchNearbyStores } from "@/lib/stores/actions";
import { Spinner } from "@/components/spinner";
import { InfoDialog } from "@/components/info-dialog";
import { FALLBACK_LOCATION } from "@/lib/constants";
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
  const [deniedNoticeDismissed, setDeniedNoticeDismissed] = useState(false);

  // Kicks off the actual permission prompt whenever status flips back to
  // "requesting" (on mount every time this screen is opened). All state
  // updates here happen inside getCurrentPosition's callbacks, not
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

  // Once we know the outcome (granted or not), always load a map — real GPS
  // coords when granted, otherwise a fixed fallback location so the screen
  // isn't just an empty error state.
  const effectiveCoords = coords ?? FALLBACK_LOCATION;

  useEffect(() => {
    if (status === "requesting") return;
    let cancelled = false;
    fetchNearbyStores(effectiveCoords.latitude, effectiveCoords.longitude).then(
      (result) => {
        if (!cancelled) setStores(result);
      }
    );
    return () => {
      cancelled = true;
    };
    // effectiveCoords is derived from coords/status already in the deps below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="flex flex-col gap-4">
      {status === "denied" && !deniedNoticeDismissed && (
        <InfoDialog
          message="위치 서비스에 동의하지 않으면 위치 기반 서비스를 제공받을 수 없습니다."
          onDismiss={() => setDeniedNoticeDismissed(true)}
        />
      )}
      {(status === "unsupported" || status === "error") && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          위치 정보를 가져올 수 없어 기본 위치를 기준으로 표시합니다.
        </p>
      )}
      <StoresMapLazy
        center={effectiveCoords}
        stores={stores ?? []}
        className="h-96 w-full"
      />
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
