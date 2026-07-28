import { prisma } from "@/lib/db";
import { haversineDistanceKm } from "@/lib/stores/geo";

export async function getAllStoresWithOwner() {
  return prisma.store.findMany({
    include: { owner: { select: { email: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getStoreById(id: string) {
  return prisma.store.findUnique({
    where: { id },
    include: { owner: { select: { email: true } } },
  });
}

export async function getStoreByOwnerId(ownerId: string) {
  return prisma.store.findUnique({ where: { ownerId } });
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
  const stores = await prisma.store.findMany({ where: { status: "approved" } });
  return stores
    .map((s) => ({
      ...s,
      distanceKm: haversineDistanceKm(latitude, longitude, s.latitude, s.longitude),
    }))
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
