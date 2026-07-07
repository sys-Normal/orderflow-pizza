"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createLocalStore } from "@/lib/create-local-store";
import type { CartItem } from "@/lib/cart/types";
import { ConfirmDialog } from "@/components/confirm-dialog";

const store = createLocalStore<CartItem[]>("orderflow_cart", []);

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (pizzaId: string, size: CartItem["size"]) => void;
  updateQuantity: (
    pizzaId: string,
    size: CartItem["size"],
    quantity: number
  ) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartItem, pizzaId: string, size: CartItem["size"]) {
  return a.pizzaId === pizzaId && a.size === size;
}

function applyAddItem(item: CartItem) {
  const items = store.read();
  const existing = items.find((line) => sameLine(line, item.pizzaId, item.size));
  if (existing) {
    store.write(
      items.map((line) =>
        sameLine(line, item.pizzaId, item.size)
          ? { ...line, quantity: line.quantity + item.quantity }
          : line
      )
    );
    return;
  }
  store.write([...items, item]);
}

function removeItem(pizzaId: string, size: CartItem["size"]) {
  store.write(store.read().filter((line) => !sameLine(line, pizzaId, size)));
}

function updateQuantity(
  pizzaId: string,
  size: CartItem["size"],
  quantity: number
) {
  if (quantity <= 0) {
    removeItem(pizzaId, size);
    return;
  }
  store.write(
    store.read().map((line) =>
      sameLine(line, pizzaId, size) ? { ...line, quantity } : line
    )
  );
}

function clearCart() {
  store.write([]);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  const [pendingItem, setPendingItem] = useState<CartItem | null>(null);

  // A cart can only hold items from one store at a time, since an order is
  // placed against a single storeId. Adding from a different store asks the
  // customer to confirm swapping the cart instead of silently mixing stores.
  const addItem = useCallback((item: CartItem) => {
    const currentStoreId = store.read()[0]?.storeId;
    if (currentStoreId && currentStoreId !== item.storeId) {
      setPendingItem(item);
      return;
    }
    applyAddItem(item);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0
    );
    const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);
    return {
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      itemCount,
    };
  }, [items, addItem]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {pendingItem && (
        <ConfirmDialog
          title="다른 매장 메뉴 담기"
          message={`장바구니에 담긴 ${items[0]?.storeName ?? ""} 메뉴를 비우고 ${
            pendingItem.storeName
          } 메뉴로 새로 담을까요?`}
          confirmLabel="교체하기"
          cancelLabel="취소"
          onConfirm={() => {
            clearCart();
            applyAddItem(pendingItem);
            setPendingItem(null);
          }}
          onCancel={() => setPendingItem(null)}
        />
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
