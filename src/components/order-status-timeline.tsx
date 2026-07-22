"use client";

import { useEffect, useState } from "react";
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
            <div key={status} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-black/[.15] text-zinc-400 dark:border-white/[.2]"
                  } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}`}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={`whitespace-nowrap text-center text-xs ${
                    done ? "font-medium text-foreground" : "text-zinc-400"
                  }`}
                >
                  {ORDER_STATUS_LABELS[status]}
                </span>
                <span className="h-4 text-[10px] text-zinc-400">
                  {changedAt ? new Date(changedAt).toLocaleTimeString("ko-KR") : ""}
                </span>
              </div>
              {index < STATUS_ORDER.length - 1 && (
                <div
                  className={`mx-1 mb-4 h-0.5 flex-1 ${
                    index < currentIndex
                      ? "bg-primary"
                      : "bg-black/[.1] dark:bg-white/[.15]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
