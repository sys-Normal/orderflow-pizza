import { prisma } from "@/lib/db";
import type { MenuCategory, Pizza } from "@/lib/menu/types";

function toPizza(item: {
  id: string;
  name: string;
  description: string;
  category: string;
  priceS: number;
  priceM: number;
  priceL: number;
}): Pizza {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category as MenuCategory,
    prices: { S: item.priceS, M: item.priceM, L: item.priceL },
  };
}

export async function getMenu(storeId: string): Promise<Pizza[]> {
  const items = await prisma.menuItem.findMany({
    where: { storeId, isAvailable: true },
  });
  return items.map(toPizza);
}
