"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  variant: string | null;
  quantity: number;
  maxStock: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  remove: (productId: string, variant: string | null) => void;
  setQuantity: (productId: string, variant: string | null, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "uz90_cart_v1";

const sameLine = (l: CartLine, productId: string, variant: string | null) =>
  l.productId === productId && (l.variant ?? null) === (variant ?? null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Hydrate from localStorage after mount so server and client markup match.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      /* storage can be unavailable in private mode — an empty cart is fine */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* quota or blocked storage — the cart still works for this page view */
    }
  }, [lines, ready]);

  const add = useCallback<CartContextValue["add"]>((line, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, line.productId, line.variant));
      if (existing) {
        const cap = line.maxStock > 0 ? line.maxStock : 99;
        return prev.map((l) =>
          sameLine(l, line.productId, line.variant)
            ? { ...l, quantity: Math.min(l.quantity + quantity, cap) }
            : l,
        );
      }
      return [...prev, { ...line, quantity }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback<CartContextValue["remove"]>((productId, variant) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, productId, variant)));
  }, []);

  const setQuantity = useCallback<CartContextValue["setQuantity"]>((productId, variant, quantity) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => !sameLine(l, productId, variant))
        : prev.map((l) => (sameLine(l, productId, variant) ? { ...l, quantity } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    ready,
    isOpen,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    add,
    remove,
    setQuantity,
    clear,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  }), [lines, ready, isOpen, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
