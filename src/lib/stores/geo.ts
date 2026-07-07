const EARTH_RADIUS_KM = 6371;
const KM_PER_LATITUDE_DEGREE = 111.32;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Uniform random point inside a disk of `radiusKm` around (lat, lng),
// using the sqrt(random) trick so points aren't bunched near the center.
export function randomPointWithinRadiusKm(
  lat: number,
  lng: number,
  radiusKm: number
): { latitude: number; longitude: number } {
  const angle = Math.random() * 2 * Math.PI;
  const distanceKm = radiusKm * Math.sqrt(Math.random());
  const latOffset = (distanceKm / KM_PER_LATITUDE_DEGREE) * Math.cos(angle);
  const lngOffset =
    (distanceKm / (KM_PER_LATITUDE_DEGREE * Math.cos(toRad(lat)))) *
    Math.sin(angle);
  return { latitude: lat + latOffset, longitude: lng + lngOffset };
}
