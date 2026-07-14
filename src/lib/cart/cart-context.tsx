"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createLocalStore } from "@/lib/create-local-store";
import type { CartItem } from "@/lib/cart/types";
import { saveCart } from "@/lib/cart/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";

const store = createLocalStore<CartItem[]>("orderflow_cart", []);

// Marks whether the current local cart belongs to a logged-in account, so a
// guest visiting this device after logout doesn't inherit that account's cart.
const OWNED_KEY = "orderflow_cart_owned";
function markOwned() {
  try {
    window.localStorage.setItem(OWNED_KEY, "1");
  } catch {}
}
function wasOwned(): boolean {
  try {
    return window.localStorage.getItem(OWNED_KEY) === "1";
  } catch {
    return false;
  }
}
function clearOwned() {
  try {
    window.localStorage.removeItem(OWNED_KEY);
  } catch {}
}

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

export function CartProvider({
  children,
  isLoggedIn = false,
  initialServerCart = [],
}: {
  children: ReactNode;
  isLoggedIn?: boolean;
  initialServerCart?: CartItem[];
}) {
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  const [pendingItem, setPendingItem] = useState<CartItem | null>(null);
  const [cartConflict, setCartConflict] = useState<{
    local: CartItem[];
    server: CartItem[];
  } | null>(null);

  // Reconcile the local (guest) cart with the account's saved cart whenever
  // the auth state settles. This must react to isLoggedIn *transitions*, not
  // just mount: logging in redirects within the same customer layout, so
  // CartProvider stays mounted and only its props change. Rules the user chose:
  // - logging in + server cart exists, local empty → server wins (resume across devices)
  // - logging in + server empty                    → promote whatever was in the local cart
  // - logging in + BOTH have items                  → ask (see cartConflict below); silently
  //   picking one used to discard the other without warning, worst-case right at checkout
  // - guest after a prior logout                    → clear this device's cart
  //
  // Gotcha: `was === true` only catches transitions within the *same* mount —
  // any hard reload, new tab, or dev-server restart remounts CartProvider and
  // resets this ref to null, even though the session cookie is still logged
  // in. Without also checking `wasOwned()` (a durable localStorage flag), that
  // remount looks identical to a fresh login and re-triggers the conflict
  // prompt on an ordinary page refresh, not just an actual login action.
  const prevLoggedIn = useRef<boolean | null>(null);
  useEffect(() => {
    const was = prevLoggedIn.current;
    prevLoggedIn.current = isLoggedIn;

    if (isLoggedIn) {
      if (was === true || wasOwned()) {
        markOwned();
        return; // already reconciled while logged in, on this device
      }
      const local = store.read();
      if (initialServerCart.length > 0 && local.length > 0) {
        // Not derivable from render: this only fires once, on the genuine
        // false→true isLoggedIn transition guarded above, to surface a
        // one-time reconciliation prompt — not a render-time value sync.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartConflict({ local, server: initialServerCart });
      } else if (initialServerCart.length > 0) {
        store.write(initialServerCart);
      } else if (local.length > 0) {
        void saveCart(local).catch(() => {});
      }
      markOwned();
    } else if (was === true || wasOwned()) {
      store.write([]);
      clearOwned();
    }
    // initialServerCart is read only at the moment we transition into the
    // logged-in state, so it's intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Persist to the account on every change while logged in (debounced so
  // rapid quantity edits don't each hit the DB). Skipped while a cartConflict
  // is unresolved so this doesn't race ahead and save the guest cart over the
  // server cart before the user has picked which one to keep.
  useEffect(() => {
    if (!isLoggedIn || cartConflict) return;
    const timer = setTimeout(() => {
      void saveCart(items).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [items, isLoggedIn, cartConflict]);

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
      {cartConflict && (
        <ConfirmDialog
          title="다른 장바구니 발견"
          message="계정에 저장된 장바구니가 있어요. 저장된 장바구니를 불러올까요, 아니면 방금 담은 내용을 유지할까요?"
          confirmLabel="저장된 장바구니 불러오기"
          cancelLabel="방금 담은 내용 유지"
          onConfirm={() => {
            store.write(cartConflict.server);
            setCartConflict(null);
          }}
          onCancel={() => {
            void saveCart(cartConflict.local).catch(() => {});
            setCartConflict(null);
          }}
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
