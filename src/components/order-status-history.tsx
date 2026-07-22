"use client";

import { useEffect, useState } from "react";
import { ORDER_STATUS_LABELS, type OrderStatusHistoryEntry } from "@/lib/orders/types";

// Plain list for now — P3 of docs/realtime-delivery-tracking.md replaces
// this with a proper timeline UI. This is the P1 test surface: open two
// tabs on the same order, change status in one, watch it appear here in
// the other without a reload.
export function OrderStatusHistory({
  orderId,
  initialHistory,
}: {
  orderId: string;
  initialHistory: OrderStatusHistoryEntry[];
}) {
  const [history, setHistory] = useState(initialHistory);

  useEffect(() => {
    const source = new EventSource(`/api/orders/${orderId}/stream`);
    source.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data) as OrderStatusHistoryEntry;
        setHistory((current) => [...current, entry]);
      } catch {
        // Malformed/heartbeat payload — ignore.
      }
    };
    return () => source.close();
  }, [orderId]);

  return (
    <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
      {history.map((entry, index) => (
        <li key={index}>
          {new Date(entry.changedAt).toLocaleString("ko-KR")} —{" "}
          {ORDER_STATUS_LABELS[entry.status]}
        </li>
      ))}
    </ul>
  );
}
