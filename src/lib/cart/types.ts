import type { MenuCategory, PizzaSize } from "@/lib/menu/types";

export type CartItem = {
  pizzaId: string;
  name: string;
  category: MenuCategory;
  size: PizzaSize;
  unitPrice: number;
  quantity: number;
  storeId: string;
  storeName: string;
};
