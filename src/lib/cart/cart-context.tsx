"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createLocalStore } from "@/lib/create-local-store";
import type { CartItem } from "@/lib/cart/types";

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

function addItem(item: CartItem) {
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
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
