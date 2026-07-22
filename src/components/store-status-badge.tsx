import type { StoreStatus } from "@/generated/prisma/client";
import { STORE_STATUS_BADGE_CLASS, STORE_STATUS_LABELS } from "@/lib/stores/status";

export function StoreStatusBadge({ status }: { status: StoreStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STORE_STATUS_BADGE_CLASS[status]}`}
    >
      {STORE_STATUS_LABELS[status]}
    </span>
  );
}
