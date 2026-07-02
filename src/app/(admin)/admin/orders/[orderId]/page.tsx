"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useOrder, updateOrderStatus } from "@/lib/orders/storage";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders/types";
import { CartSummary } from "@/components/cart-summary";

const STATUSES: OrderStatus[] = ["received", "preparing", "ready", "completed"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const order = useOrder(params.orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          주문을 찾을 수 없습니다
        </h1>
        <Link
          href="/admin/orders"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
        >
          주문 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">주문 상세</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          주문번호: {order.id}
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-medium">고객 정보</h2>
        <p className="text-sm">{order.customer.name}</p>
        <p className="text-sm">{order.customer.phone}</p>
        <p className="text-sm">{order.customer.address}</p>
        {order.customer.notes && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            요청사항: {order.customer.notes}
          </p>
        )}
      </div>

      <CartSummary items={order.items} subtotal={order.subtotal} />

      <div>
        <h2 className="mb-2 font-medium">상태</h2>
        <div className="flex gap-2">
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => updateOrderStatus(order.id, status)}
              className={`rounded-full border px-3 py-1 text-sm ${
                order.status === status
                  ? "border-foreground bg-foreground text-background"
                  : "border-black/[.08] dark:border-white/[.145]"
              }`}
            >
              {ORDER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
