"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/orders/actions";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders/types";
import { FullScreenLoading } from "@/components/full-screen-loading";

const STATUSES: OrderStatus[] = ["received", "preparing", "ready", "completed"];

export function OrderStatusButtons({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {isPending && <FullScreenLoading message="상태 변경 중..." />}
      {STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => updateOrderStatus(orderId, status))}
          className={`rounded-full border px-3 py-1 text-sm disabled:opacity-50 ${
            currentStatus === status
              ? "border-primary bg-primary text-primary-foreground"
              : "border-black/[.08] dark:border-white/[.145]"
          }`}
        >
          {ORDER_STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}
