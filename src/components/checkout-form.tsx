"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { createOrder } from "@/lib/orders/actions";
import { deleteDeliveryPreset } from "@/lib/delivery/actions";
import type { DeliveryPreset } from "@/lib/delivery/types";
import { CartSummary } from "@/components/cart-summary";
import { StoreBadge } from "@/components/store-badge";
import { FullScreenLoading } from "@/components/full-screen-loading";
import { useToast } from "@/lib/toast/toast-context";

const PHONE_PREFIXES = ["010", "011", "016", "017", "018", "019"];

type SavedAddress = { name: string; phone: string; address: string };

// Saved phones are stored dash-joined ("010-1234-5678", see handleSubmit
// below) — split back into the three controlled inputs.
function splitPhone(phone: string): [string, string, string] {
  const parts = phone.split("-");
  if (parts.length === 3) return [parts[0], parts[1], parts[2]];
  return [PHONE_PREFIXES[0], "", ""];
}

export function CheckoutForm({
  savedAddress,
  presets: initialPresets,
}: {
  savedAddress: SavedAddress | null;
  presets: DeliveryPreset[];
}) {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const { showToast } = useToast();

  const initialPhone = savedAddress
    ? splitPhone(savedAddress.phone)
    : [PHONE_PREFIXES[0], "", ""];
  const [name, setName] = useState(savedAddress?.name ?? "");
  const [phonePrefix, setPhonePrefix] = useState(initialPhone[0]);
  const [phoneMiddle, setPhoneMiddle] = useState(initialPhone[1]);
  const [phoneLast, setPhoneLast] = useState(initialPhone[2]);
  const [address, setAddress] = useState(savedAddress?.address ?? "");
  const [notes, setNotes] = useState("");
  const [rememberAddress, setRememberAddress] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [presets, setPresets] = useState(initialPresets);

  function applyPreset(preset: DeliveryPreset) {
    setName(preset.name);
    const [prefix, middle, last] = splitPhone(preset.phone);
    setPhonePrefix(prefix);
    setPhoneMiddle(middle);
    setPhoneLast(last);
    setAddress(preset.address);
  }

  async function handleDeletePreset(id: string) {
    try {
      await deleteDeliveryPreset(id);
      setPresets((current) => current.filter((preset) => preset.id !== id));
    } catch {
      showToast("프리셋 삭제에 실패했습니다.");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const phone = `${phonePrefix}-${phoneMiddle}-${phoneLast}`;
      const order = await createOrder({
        storeId: items[0].storeId,
        items,
        subtotal,
        customer: { name, phone, address, notes: notes || undefined },
        rememberAddress,
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
          href="/stores"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          매장 보러가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 self-start text-sm text-zinc-600 hover:text-primary dark:text-zinc-400"
      >
        <ArrowLeft className="h-4 w-4" />
        장바구니
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">주문하기</h1>
      <StoreBadge storeName={items[0].storeName} subtitle="주문 매장" />
      <CartSummary items={items} subtotal={subtotal} />

      <h2 className="border-t border-black/[.08] pt-6 text-lg font-semibold tracking-tight dark:border-white/[.145]">
        배송지 정보
      </h2>

      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center gap-1 rounded-full border border-black/[.08] py-1 pl-3 pr-1 text-xs font-medium dark:border-white/[.145]"
            >
              <button
                type="button"
                onClick={() => applyPreset(preset)}
                className="transition-colors hover:text-primary"
              >
                {preset.label}
              </button>
              <button
                type="button"
                onClick={() => handleDeletePreset(preset.id)}
                aria-label={`${preset.label} 프리셋 삭제`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-black/[.08] hover:text-red-600 dark:hover:bg-white/[.1]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

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

        <div className="flex items-center gap-2">
          <input
            id="remember-address"
            type="checkbox"
            checked={rememberAddress}
            onChange={(e) => setRememberAddress(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-primary"
          />
          <label htmlFor="remember-address" className="text-sm">
            이 배송지 정보를 다음에도 사용하기
          </label>
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
