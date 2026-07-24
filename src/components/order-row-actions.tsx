"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/orders/actions";
import { ORDER_NEXT_ACTION, type OrderStatus } from "@/lib/orders/types";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const nextAction = ORDER_NEXT_ACTION[status];

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
          onClick={() => setConfirmingCancel(true)}
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
      {confirmingCancel && (
        <ConfirmDialog
          title="주문 거절"
          message="이 주문을 거절하시겠습니까?"
          confirmLabel="거절"
          cancelLabel="취소"
          onConfirm={() => {
            setConfirmingCancel(false);
            startTransition(() => updateOrderStatus(orderId, "cancelled"));
          }}
          onCancel={() => setConfirmingCancel(false)}
        />
      )}
    </div>
  );
}
