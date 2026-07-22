import type { StoreStatus } from "@/generated/prisma/client";

export const STORE_STATUSES: StoreStatus[] = [
  "pending",
  "approved",
  "suspended",
  "rejected",
];

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  pending: "승인 대기",
  approved: "승인됨",
  suspended: "정지됨",
  rejected: "거절됨",
};

export const STORE_STATUS_BADGE_CLASS: Record<StoreStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  suspended: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};
