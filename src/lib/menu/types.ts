export type PizzaSize = "S" | "M" | "L";

export type MenuCategory = "pizza" | "chicken" | "side" | "drink";

export const MENU_CATEGORY_ORDER: MenuCategory[] = [
  "pizza",
  "chicken",
  "side",
  "drink",
];

export const MENU_CATEGORY_LABELS: Record<MenuCategory, string> = {
  pizza: "피자",
  chicken: "치킨",
  side: "사이드",
  drink: "음료",
};

export type Pizza = {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  prices: Record<PizzaSize, number>;
};
