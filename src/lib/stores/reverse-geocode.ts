const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

// Nominatim's usage policy caps this at ~1 req/sec and requires a real
// User-Agent, so cache aggressively — store coordinates rarely change.
const CACHE_SECONDS = 60 * 60 * 24 * 7;

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const url = new URL(NOMINATIM_REVERSE_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", latitude.toFixed(6));
  url.searchParams.set("lon", longitude.toFixed(6));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "ko");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "orderflow-pizza-portfolio (admin store list)" },
      next: { revalidate: CACHE_SECONDS },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const a = data.address ?? {};
    const district = a.borough ?? a.city_district ?? a.county ?? "";
    const neighbourhood = a.quarter ?? a.neighbourhood ?? a.suburb ?? "";
    const road = a.road ?? "";
    const houseNumber = a.house_number ?? "";
    const parts = [district, neighbourhood, road, houseNumber].filter(Boolean);

    return parts.length > 0 ? parts.join(" ") : (data.display_name ?? null);
  } catch {
    return null;
  }
}
