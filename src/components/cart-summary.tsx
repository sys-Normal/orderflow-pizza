import type { CartItem } from "@/lib/cart/types";

type SummaryLine = Pick<
  CartItem,
  "pizzaId" | "name" | "size" | "unitPrice" | "quantity"
>;

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function CartSummary({
  items,
  subtotal,
  onUpdateQuantity,
  onRemove,
}: {
  items: SummaryLine[];
  subtotal: number;
  onUpdateQuantity?: (pizzaId: string, size: CartItem["size"], quantity: number) => void;
  onRemove?: (pizzaId: string, size: CartItem["size"]) => void;
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
                {line.name} ({line.size})
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatPrice(line.unitPrice)} x {line.quantity}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {editable ? (
                <>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      onUpdateQuantity?.(
                        line.pizzaId,
                        line.size,
                        Number(e.target.value)
                      )
                    }
                    className="w-16 rounded border border-black/[.08] bg-transparent px-2 py-1 text-sm dark:border-white/[.145]"
                  />
                  <button
                    type="button"
                    onClick={() => onRemove?.(line.pizzaId, line.size)}
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    삭제
                  </button>
                </>
              ) : (
                <span className="font-medium">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between text-lg font-semibold">
        <span>합계</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
