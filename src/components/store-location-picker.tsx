"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { searchStoreAddress } from "@/lib/stores/actions";
import { StoreLocationPickerMapLazy } from "@/components/store-location-picker-map-lazy";
import { FALLBACK_LOCATION } from "@/lib/constants";
import type { GeocodeResult } from "@/lib/stores/forward-geocode";

export function StoreLocationPicker() {
  const [position, setPosition] = useState(FALLBACK_LOCATION);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
    setSelectedAddress(null);
    startTransition(async () => {
      const found = await searchStoreAddress(query);
      setResults(found);
    });
  }

  // Clicking a result row previews it on the map without committing —
  // lets the admin flip through candidates before picking one.
  function handlePreview(result: GeocodeResult) {
    setPosition({ latitude: result.latitude, longitude: result.longitude });
  }

  // The row's "선택" button is the actual commit: closes the list and
  // records the address label for confirmation.
  function handleSelect(result: GeocodeResult) {
    setPosition({ latitude: result.latitude, longitude: result.longitude });
    setSelectedAddress(result.address);
    setResults(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="address-search" className="text-sm font-medium">
        위치
      </label>
      <div className="flex gap-2">
        <input
          id="address-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="주소 또는 지점명으로 검색"
          className="flex-1 rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isPending || !query.trim()}
          aria-label="주소 검색"
          className="flex shrink-0 items-center justify-center rounded border border-black/[.08] px-3 disabled:opacity-50 dark:border-white/[.145]"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {results !== null &&
        (results.length === 0 ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            주소를 찾을 수 없습니다. 다른 검색어로 시도해주세요.
          </p>
        ) : (
          <ul className="flex flex-col overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]">
            {results.map((result, index) => (
              <li
                key={`${result.latitude}-${result.longitude}-${index}`}
                className="flex items-center gap-2 border-b border-black/[.08] pr-2 last:border-b-0 dark:border-white/[.145]"
              >
                <button
                  type="button"
                  onClick={() => handlePreview(result)}
                  className="flex-1 px-3 py-2 text-left text-sm hover:bg-black/[.05] dark:hover:bg-white/[.08]"
                >
                  {result.address}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="shrink-0 rounded-full border border-black/[.08] px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary dark:border-white/[.145]"
                >
                  선택
                </button>
              </li>
            ))}
          </ul>
        ))}
      {selectedAddress && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedAddress}</p>
      )}

      <StoreLocationPickerMapLazy
        position={position}
        onChange={(next) => {
          setPosition(next);
          // A manual map click overrides whatever address was picked from
          // search results, so that label would otherwise go stale.
          setSelectedAddress(null);
        }}
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        지도를 클릭해 정확한 위치로 조정할 수 있습니다.
      </p>

      <input type="hidden" name="latitude" value={position.latitude} />
      <input type="hidden" name="longitude" value={position.longitude} />
    </div>
  );
}
