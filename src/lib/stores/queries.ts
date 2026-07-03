import { prisma } from "@/lib/db";

export async function getAllStoresWithOwner() {
  return prisma.store.findMany({
    include: { owner: { select: { email: true } } },
    orderBy: { createdAt: "asc" },
  });
}
