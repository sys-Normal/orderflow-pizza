import type { Order } from "@/lib/orders/types";
import { OrderListItem } from "@/components/order-list-item";

export function OrderList({
  orders,
  emptyMessage = "아직 접수된 주문이 없습니다.",
  showActions = false,
}: {
  orders: Order[];
  emptyMessage?: string;
  // Only the seller's own live feed gets action buttons — see
  // live-order-feed.tsx. The cross-store search list (platform_admin) has no
  // SSE subscription to reflect the resulting status change in place.
  showActions?: boolean;
}) {
  if (orders.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <OrderListItem key={order.id} order={order} showActions={showActions} />
      ))}
    </ul>
  );
}
