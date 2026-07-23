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
  | "completed"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "접수됨",
  preparing: "조리중",
  ready: "배달/픽업 준비완료",
  delivering: "배달중",
  completed: "완료",
  cancelled: "거절됨",
};

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  received: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  preparing: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  ready: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  delivering: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

// Linear progress flow a seller drives an order through — cancelled is a
// terminal side-branch, not a step in this sequence (see order-status-timeline.tsx).
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "delivering",
  "completed",
];

// Powers the single "다음 단계" action button on each order-list row: the
// label names the action the seller takes, not the resulting status.
export const ORDER_NEXT_ACTION: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  received: { next: "preparing", label: "주문 수락" },
  preparing: { next: "ready", label: "조리 완료" },
  ready: { next: "delivering", label: "배달 시작" },
  delivering: { next: "completed", label: "배달 완료" },
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
