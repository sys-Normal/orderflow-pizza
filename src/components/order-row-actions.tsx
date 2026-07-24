"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/orders/actions";
import { ORDER_NEXT_ACTION, type OrderStatus } from "@/lib/orders/types";

// Single dynamic-label action button per order-list row (see decision-log
// for why not a full status-picker here — that stays on the detail page).
export function OrderRowActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const nextAction = ORDER_NEXT_ACTION[status];

  function handleCancel() {
    if (!window.confirm("이 주문을 거절하시겠습니까?")) return;
    startTransition(() => updateOrderStatus(orderId, "cancelled"));
  }

  function handleAdvance() {
    if (!nextAction) return;
    startTransition(() => updateOrderStatus(orderId, nextAction.next));
  }

  if (!nextAction) return null;

  return (
    <div className="flex shrink-0 gap-2">
      {status === "received" && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleCancel}
          className="rounded-full border border-rose-300 px-3 py-1.5 text-sm text-rose-600 disabled:opacity-50 dark:border-rose-500/40 dark:text-rose-400"
        >
          거절
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={handleAdvance}
        className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {nextAction.label}
      </button>
    </div>
  );
}
