"use client";

import { useTransition } from "react";
import { updateStoreStatus } from "@/lib/stores/actions";
import type { StoreStatus } from "@/generated/prisma/client";

const STATUSES: StoreStatus[] = ["pending", "approved", "suspended", "rejected"];

const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  pending: "승인 대기",
  approved: "승인됨",
  suspended: "정지됨",
  rejected: "거절됨",
};

export function StoreStatusButtons({
  storeId,
  currentStatus,
}: {
  storeId: string;
  currentStatus: StoreStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => updateStoreStatus(storeId, status))}
          className={`rounded-full border px-3 py-1 text-sm disabled:opacity-50 ${
            currentStatus === status
              ? "border-primary bg-primary text-primary-foreground"
              : "border-black/[.08] dark:border-white/[.145]"
          }`}
        >
          {STORE_STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}
