"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import { updateStoreStatus } from "@/lib/stores/actions";
import type { StoreStatus } from "@/generated/prisma/client";
import { STORE_STATUSES, STORE_STATUS_LABELS } from "@/lib/stores/status";
import { useToast } from "@/lib/toast/toast-context";

export function StoreStatusDropdown({
  storeId,
  currentStatus,
}: {
  storeId: string;
  currentStatus: StoreStatus;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(status: StoreStatus) {
    setOpen(false);
    if (status === currentStatus) return;
    startTransition(async () => {
      await updateStoreStatus(storeId, status);
      showToast(`상태가 "${STORE_STATUS_LABELS[status]}"(으)로 변경되었습니다.`);
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={isPending}
        aria-label="매장 상태 변경"
        aria-expanded={open}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/[.08] disabled:opacity-50 dark:border-white/[.145]"
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-36 rounded-lg border border-black/[.08] bg-surface p-1 shadow-lg dark:border-white/[.145]">
          {STORE_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleSelect(status)}
              className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/[.05] dark:hover:bg-white/[.08]"
            >
              {STORE_STATUS_LABELS[status]}
              {status === currentStatus && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
