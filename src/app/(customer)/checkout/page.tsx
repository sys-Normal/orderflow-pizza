"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { createOrder } from "@/lib/orders/actions";
import { CartSummary } from "@/components/cart-summary";
import { FullScreenLoading } from "@/components/full-screen-loading";
import { useToast } from "@/lib/toast/toast-context";

const PHONE_PREFIXES = ["010", "011", "016", "017", "018", "019"];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState(PHONE_PREFIXES[0]);
  const [phoneMiddle, setPhoneMiddle] = useState("");
  const [phoneLast, setPhoneLast] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const phone = `${phonePrefix}-${phoneMiddle}-${phoneLast}`;
      const order = await createOrder({
        items,
        subtotal,
        customer: { name, phone, address, notes: notes || undefined },
      });
      clearCart();
      router.push(`/confirmation/${order.id}`);
    } catch {
      setIsSubmitting(false);
      showToast("주문에 실패했습니다. 다시 시도해주세요.");
    }
  }

  // Guard this before the empty-cart check below: clearCart() (on success)
  // flips items to [] and would otherwise flash that "cart is empty" view
  // for a moment before router.push finishes navigating away.
  if (isSubmitting) {
    return <FullScreenLoading message="주문 처리 중..." />;
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
          <label htmlFor="phone-middle" className="text-sm font-medium">
            연락처
          </label>
          <div className="flex items-center gap-2">
            <select
              id="phone-prefix"
              aria-label="전화번호 앞자리"
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
              className="rounded border border-black/[.08] bg-background px-2 py-2 text-foreground dark:border-white/[.145]"
            >
              {PHONE_PREFIXES.map((prefix) => (
                <option key={prefix} value={prefix} className="bg-background text-foreground">
                  {prefix}
                </option>
              ))}
            </select>
            <span aria-hidden="true">-</span>
            <input
              id="phone-middle"
              required
              inputMode="numeric"
              pattern="[0-9]{3,4}"
              maxLength={4}
              aria-label="전화번호 가운데 자리"
              value={phoneMiddle}
              onChange={(e) => setPhoneMiddle(e.target.value.replace(/\D/g, ""))}
              className="w-20 rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
            />
            <span aria-hidden="true">-</span>
            <input
              id="phone-last"
              required
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              aria-label="전화번호 마지막 자리"
              value={phoneLast}
              onChange={(e) => setPhoneLast(e.target.value.replace(/\D/g, ""))}
              className="w-20 rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
            />
          </div>
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
