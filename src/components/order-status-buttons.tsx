"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/orders/actions";
import {
  ORDER_STATUS_FLOW as STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/orders/types";
import { FullScreenLoading } from "@/components/full-screen-loading";

export function OrderStatusButtons({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    if (!window.confirm("이 주문을 거절하시겠습니까?")) return;
    startTransition(() => updateOrderStatus(orderId, "cancelled"));
  }

  return (
    <div className="flex flex-wrap gap-2">
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
      {/* 최초 접수 단계에서만 거절 가능 — 조리를 이미 시작한 주문은 취소가 아니라
          완료까지 진행하는 게 맞다는 판단 (docs/decision-log.md 참고). */}
      {currentStatus === "received" && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleCancel}
          className="rounded-full border border-rose-300 px-3 py-1 text-sm text-rose-600 disabled:opacity-50 dark:border-rose-500/40 dark:text-rose-400"
        >
          {ORDER_STATUS_LABELS.cancelled}
        </button>
      )}
    </div>
  );
}
