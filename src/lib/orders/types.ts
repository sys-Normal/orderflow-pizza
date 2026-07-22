import type { PizzaSize } from "@/lib/menu/types";

export type OrderItem = {
  pizzaId: string;
  name: string;
  size: PizzaSize;
  unitPrice: number;
  quantity: number;
};

export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "접수됨",
  preparing: "조리중",
  ready: "배달/픽업 준비완료",
  delivering: "배달중",
  completed: "완료",
};

export type OrderStatusHistoryEntry = {
  status: OrderStatus;
  changedAt: string;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  address: string;
  notes?: string;
};

export type Order = {
  id: string;
  storeId: string;
  items: OrderItem[];
  customer: OrderCustomer;
  status: OrderStatus;
  subtotal: number;
  createdAt: string;
};
