"use client";

import { Fragment, useEffect, useState } from "react";
import { Check } from "lucide-react";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
  type OrderStatusHistoryEntry,
} from "@/lib/orders/types";

const STATUS_ORDER: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "delivering",
  "completed",
];

export function OrderStatusTimeline({
  orderId,
  initialStatus,
  initialHistory,
}: {
  orderId: string;
  initialStatus: OrderStatus;
  initialHistory: OrderStatusHistoryEntry[];
}) {
  const [history, setHistory] = useState(initialHistory);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  // Live updates only — if the connection can't be established (session
  // expired, etc.) the page still shows the correct status as of load.
  useEffect(() => {
    const source = new EventSource(`/api/orders/${orderId}/stream`);
    source.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data) as OrderStatusHistoryEntry;
        setHistory((current) => [...current, entry]);
        setCurrentStatus(entry.status);
      } catch {
        // Heartbeat comment lines don't reach onmessage; this guards
        // against any other malformed payload.
      }
    };
    return () => source.close();
  }, [orderId]);

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const changedAtByStatus = new Map(
    history.map((entry) => [entry.status, entry.changedAt])
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start">
        {STATUS_ORDER.map((status, index) => {
          const done = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const changedAt = changedAtByStatus.get(status);
          return (
            <Fragment key={status}>
              <div className="flex w-16 shrink-0 flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-black/[.15] text-zinc-400 dark:border-white/[.2]"
                  } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}`}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {/* Fixed-width column (not whitespace-nowrap) so a long
                    label like "배달/픽업 준비완료" wraps onto a second line
                    instead of stretching this step wider than the rest —
                    every column takes equal space either way, which is
                    what actually keeps the connector lines even. */}
                <span
                  className={`break-keep text-center text-xs leading-tight ${
                    done ? "font-medium text-foreground" : "text-zinc-400"
                  }`}
                >
                  {ORDER_STATUS_LABELS[status]}
                </span>
                <span className="h-4 text-xs text-zinc-400">
                  {changedAt
                    ? new Date(changedAt).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : ""}
                </span>
              </div>
              {/* Sibling of the column above (not nested inside a
                  per-step flex-1 wrapper) so every connector shares the
                  same leftover space equally, regardless of how wide any
                  one step's label is. mt-[15px] centers it on the h-8
                  circle (16px from the row's top) rather than the whole
                  column. */}
              {index < STATUS_ORDER.length - 1 && (
                <div
                  className={`mx-1 mt-[15px] h-0.5 flex-1 ${
                    index < currentIndex
                      ? "bg-primary"
                      : "bg-black/[.1] dark:bg-white/[.15]"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
