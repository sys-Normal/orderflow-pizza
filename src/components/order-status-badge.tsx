import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/orders/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${ORDER_STATUS_BADGE_CLASS[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
