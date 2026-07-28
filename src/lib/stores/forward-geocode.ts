const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const MAX_RESULTS = 5;

export type GeocodeResult = { latitude: number; longitude: number; address: string };

type NominatimSearchHit = {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: {
    road?: string;
    house_number?: string;
    borough?: string;
    city_district?: string;
    county?: string;
    quarter?: string;
    neighbourhood?: string;
    suburb?: string;
  };
};

// Nominatim's own display_name lists the full administrative hierarchy
// ("강남역, 강남대로, 역삼1동, 강남구, 서울특별시, ..."), which reads as noise to
// someone scanning a result list. This rebuilds a short, road-name-address-style
// label instead — "강남역, 강남대로 396" — leading with the place name (if any)
// and the road/house number, falling back to district-level info or the raw
// display_name only when nothing more specific is available.
function toConciseAddress(hit: NominatimSearchHit): string {
  const a = hit.address ?? {};
  const name = hit.name?.trim();
  const road = [a.road, a.house_number].filter(Boolean).join(" ");
  const district = a.borough ?? a.city_district ?? a.county ?? "";
  const neighbourhood = a.quarter ?? a.neighbourhood ?? a.suburb ?? "";

  // When there's no road, fall back to "구 동" — but drop the 동 if it's the
  // same word as the place name itself (searching "합정동" returns a hit
  // named "합정동" whose neighbourhood field is also "합정동"), otherwise it
  // reads as "합정동, 마포구 합정동".
  const locality = road || [district, neighbourhood !== name ? neighbourhood : ""]
    .filter(Boolean)
    .join(" ");

  const parts = [name, locality].map((part) => part?.trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : hit.display_name;
}

// OSM's coverage of Korean addresses is patchy below the major-road level —
// for a query it can't actually match, Nominatim tends to fall back to
// unrelated addresses elsewhere in the world that happen to share a house
// number, rather than returning nothing (confirmed by hand: searching a real
// Seongsu-dong sub-street returned building nodes in Italy and Germany).
// Drop anything that doesn't share at least one real query word with the
// hit's own address, so those show up as an honest "not found" instead of a
// misleading result.
function isPlausibleMatch(query: string, hit: NominatimSearchHit): boolean {
  const queryTokens = query.split(/\s+/).filter((token) => token.length >= 2);
  if (queryTokens.length === 0) return true;
  return queryTokens.some((token) => hit.display_name.includes(token));
}

// Counterpart to reverseGeocode (address → coordinates instead of the other
// way around) — used by the admin "새 지점" form so an address can be typed
// in instead of guessing raw latitude/longitude. Returns several candidates
// (rather than just the top hit) since place names are often ambiguous, so
// the admin picks the right one from a list.
export async function forwardGeocode(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("limit", String(MAX_RESULTS));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "ko");
  // Every store is in Korea — no reason to ever consider a match elsewhere.
  url.searchParams.set("countrycodes", "kr");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "orderflow-pizza-portfolio (admin store creation)" },
    });
    if (!res.ok) return [];

    const allResults = (await res.json()) as NominatimSearchHit[];
    const results = allResults.filter((hit) => isPlausibleMatch(trimmed, hit));
    const concise = results.map(toConciseAddress);
    const occurrences = new Map<string, number>();
    for (const label of concise) {
      occurrences.set(label, (occurrences.get(label) ?? 0) + 1);
    }

    return results.map((hit, i) => ({
      latitude: Number(hit.lat),
      longitude: Number(hit.lon),
      // Two distinct results can still collapse to the same concise label
      // (e.g. one Nominatim entry for a neighbourhood's node vs. its
      // boundary polygon) — fall back to the full address for just those,
      // rather than showing an ambiguous "which one is which" duplicate.
      address: (occurrences.get(concise[i]) ?? 0) > 1 ? hit.display_name : concise[i],
    }));
  } catch {
    return [];
  }
}
