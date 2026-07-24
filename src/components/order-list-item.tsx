"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CartSummary } from "@/components/cart-summary";
import { OrderRowActions } from "@/components/order-row-actions";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/orders/types";

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// A seller scanning the list cares what to make, not who ordered it — the
// customer name moved into the expanded panel below.
function summarizeItems(order: Order): string {
  const [first, ...rest] = order.items;
  if (!first) return "";
  const label = `${first.name} (${first.size})`;
  return rest.length > 0 ? `${label} 외 ${rest.length}건` : label;
}

export function OrderListItem({
  order,
  showActions = false,
}: {
  order: Order;
  showActions?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="rounded-lg border border-black/[.08] bg-surface dark:border-white/[.145]">
      <div className="flex items-center justify-between gap-4 p-4">
        {/* Toggle, not a link — a stray tap here shouldn't navigate away
            mid-service. Full detail is one "자세히 보기" tap away below. */}
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="flex flex-1 items-center justify-between gap-4 text-left"
        >
          <div>
            <p className="font-medium">{summarizeItems(order)}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {new Date(order.createdAt).toLocaleString("ko-KR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium">{formatPrice(order.subtotal)}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {ORDER_STATUS_LABELS[order.status]}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
        {showActions && <OrderRowActions orderId={order.id} status={order.status} />}
      </div>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-black/[.08] p-4 dark:border-white/[.145]">
          <div className="text-sm">
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-zinc-600 dark:text-zinc-400">{order.customer.phone}</p>
            <p className="text-zinc-600 dark:text-zinc-400">{order.customer.address}</p>
            {order.customer.notes && (
              <p className="text-zinc-600 dark:text-zinc-400">요청사항: {order.customer.notes}</p>
            )}
          </div>
          <CartSummary items={order.items} subtotal={order.subtotal} />
          <div className="flex justify-end">
            <Link
              href={`/admin/orders/${order.id}`}
              className="rounded-full border border-black/[.08] px-4 py-1.5 text-sm font-medium dark:border-white/[.145]"
            >
              자세히 보기
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}
