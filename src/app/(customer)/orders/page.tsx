import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { getOrdersForBuyer } from "@/lib/orders/queries";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { ReorderButton } from "@/components/reorder-button";
import { ReviewButton } from "@/components/review-button";

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso).toLocaleDateString("ko-KR");
  const time = new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
}

export default async function MyOrdersPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "buyer") {
    redirect(`/login?next=${encodeURIComponent("/orders")}`);
  }

  const orders = await getOrdersForBuyer(session.userId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">주문 내역</h1>

      {orders.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">아직 주문한 내역이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex gap-4 rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]"
            >
              <Link
                href={`/confirmation/${order.id}`}
                className="flex flex-[7] flex-col items-start gap-1.5"
              >
                <p className="font-medium">{order.storeName}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDateTime(order.createdAt)}
                </p>
                <OrderStatusBadge status={order.status} />
                <p className="font-medium">{formatPrice(order.subtotal)}</p>
              </Link>
              <div className="flex flex-[3] flex-col items-end gap-2">
                <ReorderButton orderId={order.id} />
                <ReviewButton />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
