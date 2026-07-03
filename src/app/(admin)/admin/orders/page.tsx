import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { getOrdersForSession } from "@/lib/orders/queries";
import { ORDER_STATUS_LABELS } from "@/lib/orders/types";

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export default async function AdminOrdersPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin/login");
  const orders = await getOrdersForSession(session);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">주문 목록</h1>

      {orders.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          아직 접수된 주문이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
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
      )}
    </div>
  );
}
