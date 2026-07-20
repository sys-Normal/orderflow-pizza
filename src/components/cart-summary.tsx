import type { ReactNode } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/lib/cart/types";

type SummaryLine = Pick<
  CartItem,
  "pizzaId" | "name" | "size" | "unitPrice" | "quantity"
> & {
  // Optional because order-history views (confirmation/admin) build this
  // list from OrderItem, which doesn't track category — those keep
  // showing the size for backward compatibility. Only the live cart (which
  // always knows the category) can suppress it.
  category?: CartItem["category"];
};

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function CartSummary({
  items,
  subtotal,
  onUpdateQuantity,
  onRemove,
  afterItems,
}: {
  items: SummaryLine[];
  subtotal: number;
  onUpdateQuantity?: (pizzaId: string, size: CartItem["size"], quantity: number) => void;
  onRemove?: (pizzaId: string, size: CartItem["size"]) => void;
  afterItems?: ReactNode;
}) {
  const editable = Boolean(onUpdateQuantity && onRemove);

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {items.map((line) => (
          <li
            key={`${line.pizzaId}-${line.size}`}
            className="flex items-center justify-between gap-4 border-b border-black/[.08] pb-3 dark:border-white/[.145]"
          >
            <div>
              <p className="font-medium">
                {line.name}
                {(line.category === undefined || line.category === "pizza") &&
                  ` (${line.size})`}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatPrice(line.unitPrice)} x {line.quantity}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {editable ? (
                <div className="flex items-center divide-x divide-black/[.08] rounded-full border border-black/[.08] dark:divide-white/[.145] dark:border-white/[.145]">
                  <button
                    type="button"
                    onClick={() =>
                      line.quantity === 1
                        ? onRemove?.(line.pizzaId, line.size)
                        : onUpdateQuantity?.(line.pizzaId, line.size, line.quantity - 1)
                    }
                    aria-label={line.quantity === 1 ? "메뉴 삭제" : "수량 줄이기"}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center text-zinc-600 hover:text-primary dark:text-zinc-400"
                  >
                    {line.quantity === 1 ? (
                      <Trash2 className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                  </button>
                  <span className="flex h-9 w-9 items-center justify-center text-sm font-medium tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateQuantity?.(line.pizzaId, line.size, line.quantity + 1)
                    }
                    aria-label="수량 늘리기"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center text-zinc-600 hover:text-primary dark:text-zinc-400"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <span className="font-medium">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {afterItems}
      <div className="flex items-center justify-between text-lg font-semibold">
        <span>합계</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
