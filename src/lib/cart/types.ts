import type { PizzaSize } from "@/lib/menu/types";

export type CartItem = {
  pizzaId: string;
  name: string;
  size: PizzaSize;
  unitPrice: number;
  quantity: number;
};
