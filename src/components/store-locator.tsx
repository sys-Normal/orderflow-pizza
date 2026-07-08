"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "lucide-react";
import { StoresMapLazy } from "@/components/stores-map-lazy";
import { fetchNearbyStores } from "@/lib/stores/actions";
import { Spinner } from "@/components/spinner";
import { FALLBACK_LOCATION } from "@/lib/constants";
import type { NearbyStore } from "@/lib/stores/queries";
import type { FocusTarget } from "@/components/stores-map";

type LocationStatus =
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported"
  | "error";

export function StoreLocator() {
  // Always start at "requesting" on both server and client — Node has its
  // own global `navigator` (without `.geolocation`) since Node 21, so
  // computing support during the initial render diverges between SSR and
  // the browser and causes a hydration mismatch. The actual support check
  // only runs client-side, inside the effect below.
  const [status, setStatus] = useState<LocationStatus>("requesting");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [stores, setStores] = useState<NearbyStore[] | null>(null);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);

  // Kicks off the actual permission prompt whenever status flips back to
  // "requesting" (on mount every time this screen is opened).
  useEffect(() => {
    if (status !== "requesting") return;
    if (!("geolocation" in navigator)) {
      // Must be set here rather than during render/lazy-init — this is the
      // client-only support check itself (see comment on useState above),
      // so there's no earlier point to compute it without an SSR mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unsupported");
      return;
    }
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
      {status !== "granted" && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {status === "denied"
            ? "위치 권한이 없어 기본 위치를 기준으로 표시합니다."
            : "위치 정보를 가져올 수 없어 기본 위치를 기준으로 표시합니다."}
        </p>
      )}
      <StoresMapLazy
        center={effectiveCoords}
        stores={stores ?? []}
        focusTarget={focusTarget}
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
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            반경 3km 이내 매장 {stores.length}곳
          </p>
          <div className="flex max-h-80 flex-col overflow-y-auto rounded-lg border border-black/[.08] dark:border-white/[.145]">
            {stores.map((store) => (
              <div
                key={store.id}
                className="flex items-center justify-between gap-4 border-b border-black/[.08] p-4 last:border-b-0 dark:border-white/[.145]"
              >
                <div>
                  <p className="font-medium">{store.name}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {store.phone} · {store.distanceKm.toFixed(1)}km
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFocusTarget({ storeId: store.id, nonce: Date.now() })
                    }
                    aria-label={`${store.name} 위치로 지도 이동`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[.08] text-zinc-600 hover:border-primary hover:text-primary dark:border-white/[.145] dark:text-zinc-400"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/menu?storeId=${store.id}`}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    주문하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
