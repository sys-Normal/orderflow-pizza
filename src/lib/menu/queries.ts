import { prisma } from "@/lib/db";
import type { Pizza } from "@/lib/menu/types";

function toPizza(item: {
  id: string;
  name: string;
  description: string;
  priceS: number;
  priceM: number;
  priceL: number;
}): Pizza {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    prices: { S: item.priceS, M: item.priceM, L: item.priceL },
  };
}

export async function getMenu(): Promise<Pizza[]> {
  // No store-selection UI yet, so we show the single seeded store's menu.
  const store = await prisma.store.findFirstOrThrow();
  const items = await prisma.menuItem.findMany({
    where: { storeId: store.id, isAvailable: true },
  });
  return items.map(toPizza);
}
