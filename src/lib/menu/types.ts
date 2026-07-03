export type PizzaSize = "S" | "M" | "L";

export type Pizza = {
  id: string;
  name: string;
  description: string;
  prices: Record<PizzaSize, number>;
};
