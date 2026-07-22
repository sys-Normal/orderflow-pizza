"use client";

import { useTransition } from "react";
import { getReorderItems } from "@/lib/orders/actions";
import { useCart } from "@/lib/cart/cart-context";
import { useToast } from "@/lib/toast/toast-context";

export function ReorderButton({ orderId }: { orderId: string }) {
  const { replaceCart } = useCart();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const items = await getReorderItems(orderId);
        if (items.length === 0) {
          showToast("담을 수 있는 메뉴가 없습니다.");
          return;
        }
        replaceCart(items);
      } catch {
        showToast("재주문에 실패했습니다. 다시 시도해주세요.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
    >
      재주문하기
    </button>
  );
}
