import type { PizzaSize } from "@/lib/menu/data";

export type CartItem = {
  pizzaId: string;
  name: string;
  size: PizzaSize;
  unitPrice: number;
  quantity: number;
};
