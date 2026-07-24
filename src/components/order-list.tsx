import Link from "next/link";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/orders/types";
import { OrderRowActions } from "@/components/order-row-actions";

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

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
        <li
          key={order.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]"
        >
          <Link
            href={`/admin/orders/${order.id}`}
            className="flex flex-1 items-center justify-between gap-4"
          >
            <div>
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {new Date(order.createdAt).toLocaleString("ko-KR")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatPrice(order.subtotal)}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {ORDER_STATUS_LABELS[order.status]}
              </p>
            </div>
          </Link>
          {showActions && <OrderRowActions orderId={order.id} status={order.status} />}
        </li>
      ))}
    </ul>
  );
}
