import type { PizzaSize } from "@/lib/menu/types";

export type OrderItem = {
  pizzaId: string;
  name: string;
  size: PizzaSize;
  unitPrice: number;
  quantity: number;
};

export type OrderStatus = "received" | "preparing" | "ready" | "completed";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "접수됨",
  preparing: "조리중",
  ready: "배달/픽업 준비완료",
  completed: "완료",
};

export type OrderCustomer = {
  name: string;
  phone: string;
  address: string;
  notes?: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  customer: OrderCustomer;
  status: OrderStatus;
  subtotal: number;
  createdAt: string;
};
