"use client";

import { useEffect, useState } from "react";
import { OrderList } from "@/components/order-list";
import type { Order } from "@/lib/orders/types";
import type { StoreOrderEvent } from "@/lib/events";

// New orders land on top without a reload; status changes patch the
// matching row in place. See docs/realtime-delivery-tracking.md P3.
export function LiveOrderFeed({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    const source = new EventSource("/api/orders/stream");
    source.onmessage = (event) => {
      let payload: StoreOrderEvent;
      try {
        payload = JSON.parse(event.data) as StoreOrderEvent;
      } catch {
        return; // heartbeat/malformed — ignore
      }

      if (payload.type === "created") {
        setOrders((current) =>
          current.some((order) => order.id === payload.order.id)
            ? current
            : [payload.order, ...current]
        );
      } else {
        setOrders((current) =>
          current.map((order) =>
            order.id === payload.orderId ? { ...order, status: payload.status } : order
          )
        );
      }
    };
    return () => source.close();
  }, []);

  return <OrderList orders={orders} />;
}
