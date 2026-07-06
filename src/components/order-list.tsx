import Link from "next/link";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/orders/types";

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function OrderList({
  orders,
  emptyMessage = "아직 접수된 주문이 없습니다.",
}: {
  orders: Order[];
  emptyMessage?: string;
}) {
  if (orders.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]"
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
        </li>
      ))}
    </ul>
  );
}
