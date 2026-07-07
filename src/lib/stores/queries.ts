import { prisma } from "@/lib/db";
import { haversineDistanceKm } from "@/lib/stores/geo";
import { generateNearbyStores } from "@/lib/stores/seed-nearby";

export async function getAllStoresWithOwner() {
  return prisma.store.findMany({
    include: { owner: { select: { email: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getStoreById(id: string) {
  return prisma.store.findUnique({ where: { id } });
}

// No store-selection UI yet, so the customer-facing menu page shows the
// single seeded store. Revisit once multi-store checkout exists.
export async function getPrimaryStore() {
  return prisma.store.findFirstOrThrow();
}

export type NearbyStore = Awaited<ReturnType<typeof getNearbyStores>>[number];

export async function getNearbyStores(
  latitude: number,
  longitude: number,
  radiusKm = 3
) {
  const withinRadius = async () => {
    const stores = await prisma.store.findMany({ where: { status: "approved" } });
    return stores
      .map((s) => ({
        ...s,
        distanceKm: haversineDistanceKm(latitude, longitude, s.latitude, s.longitude),
      }))
      .filter((s) => s.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  };

  const found = await withinRadius();
  if (found.length > 0 || process.env.NODE_ENV !== "development") {
    return found;
  }

  // Local dev convenience only: nothing nearby, so generate a few branch
  // stores around this location and try again.
  await generateNearbyStores(latitude, longitude, radiusKm);
  return withinRadius();
}
