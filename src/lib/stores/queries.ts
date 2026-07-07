import { prisma } from "@/lib/db";

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
