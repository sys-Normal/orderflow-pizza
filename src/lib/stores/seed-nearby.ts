import { prisma } from "@/lib/db";
import { PROJECT_NAME } from "@/lib/constants";
import { randomPointWithinRadiusKm } from "@/lib/stores/geo";

const BRANCH_DISTRICTS = [
  "강남",
  "홍대",
  "신촌",
  "잠실",
  "성수",
  "종로",
  "이태원",
  "여의도",
  "건대",
  "신림",
];

function randomPhone(): string {
  const mid = Math.floor(1000 + Math.random() * 9000);
  const last = Math.floor(1000 + Math.random() * 9000);
  return `02-${mid}-${last}`;
}

function pickBranchNames(count: number): string[] {
  const shuffled = [...BRANCH_DISTRICTS].sort(() => Math.random() - 0.5);
  return shuffled
    .slice(0, count)
    .map((district) => `${PROJECT_NAME} ${district}점`);
}

// Local-dev-only convenience: when a customer's location has no real nearby
// store to show on the map, spin up a few branch stores (same menu, cloned
// from an existing approved store) within the requested radius so the
// store-selection map isn't empty while testing.
export async function generateNearbyStores(
  latitude: number,
  longitude: number,
  radiusKm: number,
  count = 3
) {
  const reference = await prisma.store.findFirst({
    where: { status: "approved" },
    include: { menuItems: true },
  });
  if (!reference) return [];

  const names = pickBranchNames(count);
  const created = [];
  for (const name of names) {
    const point = randomPointWithinRadiusKm(latitude, longitude, radiusKm);
    const branch = await prisma.store.create({
      data: {
        ownerId: reference.ownerId,
        name,
        description: reference.description,
        status: "approved",
        phone: randomPhone(),
        latitude: point.latitude,
        longitude: point.longitude,
        menuItems: {
          create: reference.menuItems.map((item) => ({
            name: item.name,
            description: item.description,
            category: item.category,
            priceS: item.priceS,
            priceM: item.priceM,
            priceL: item.priceL,
            isAvailable: item.isAvailable,
          })),
        },
      },
    });
    created.push(branch);
  }
  return created;
}
