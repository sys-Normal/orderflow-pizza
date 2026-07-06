"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { createOrder } from "@/lib/orders/actions";
import { CartSummary } from "@/components/cart-summary";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const order = await createOrder({
      items,
      subtotal,
      customer: { name, phone, address, notes: notes || undefined },
    });
    clearCart();
    router.push(`/confirmation/${order.id}`);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">주문하기</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          장바구니가 비어 있어 주문할 수 없습니다.
        </p>
        <Link
          href="/menu"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          메뉴 보러가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">주문하기</h1>
      <CartSummary items={items} subtotal={subtotal} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            이름
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium">
            연락처
          </label>
          <input
            id="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm font-medium">
            배송지
          </label>
          <input
            id="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-medium">
            요청사항 (선택)
          </label>
          <input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          주문 완료
        </button>
      </form>
    </div>
  );
}
