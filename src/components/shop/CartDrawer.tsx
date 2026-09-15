"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";
import { SHIPPING } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { lines, isOpen, closeCart, remove, setQuantity, subtotal, count } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  const remaining = Math.max(0, SHIPPING.countryFreeOver - subtotal);
  const progress = Math.min(100, (subtotal / SHIPPING.countryFreeOver) * 100);

  return (
    <div className={cn("fixed inset-0 z-[60]", isOpen ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        className={cn(
          "absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={closeCart}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Количка"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-lift transition-transform duration-350 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
            <ShoppingBag className="size-5 text-brand-600" aria-hidden />
            Количка
            {count > 0 && <span className="text-sm font-medium text-ink-500">({count})</span>}
          </h2>
          <button type="button" onClick={closeCart} className="rounded-lg p-2 hover:bg-ink-100" aria-label="Затвори количката">
            <X className="size-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-ink-100 text-ink-400">
              <ShoppingBag className="size-9" aria-hidden />
            </span>
            <div>
              <p className="font-display text-lg font-bold">Количката е празна</p>
              <p className="mt-1 text-sm text-ink-500">Разгледайте каталога и добавете първия си продукт.</p>
            </div>
            <Link
              href="/katalog"
              onClick={closeCart}
              className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Към каталога
            </Link>
          </div>
        ) : (
          <>
            {remaining > 0 && (
              <div className="shrink-0 border-b border-ink-100 bg-brand-50 px-5 py-3">
                <p className="text-xs text-brand-800">
                  Още <strong>{formatPrice(remaining).eur}</strong> до безплатна доставка
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-[width] duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-3">
                {lines.map((line) => {
                  const price = formatPrice(line.price * line.quantity);
                  return (
                    <li
                      key={`${line.productId}-${line.variant ?? ""}`}
                      className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-3"
                    >
                      <Link
                        href={`/produkt/${line.slug}`}
                        onClick={closeCart}
                        className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-cream-dark"
                      >
                        {line.image ? (
                          <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />
                        ) : (
                          <span className="grid h-full place-items-center text-2xl" aria-hidden>🐾</span>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/produkt/${line.slug}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-700"
                        >
                          {line.name}
                        </Link>
                        {line.variant && <p className="mt-0.5 text-xs text-ink-500">{line.variant}</p>}

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-full border border-ink-200 bg-cream">
                            <button
                              type="button"
                              onClick={() => setQuantity(line.productId, line.variant, line.quantity - 1)}
                              className="grid size-7 place-items-center rounded-full text-ink-600 hover:bg-ink-100"
                              aria-label="Намали количеството"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
                            <button
                              type="button"
                              onClick={() => setQuantity(line.productId, line.variant, line.quantity + 1)}
                              disabled={line.maxStock > 0 && line.quantity >= line.maxStock}
                              className="grid size-7 place-items-center rounded-full text-ink-600 hover:bg-ink-100 disabled:opacity-30"
                              aria-label="Увеличи количеството"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-ink-900">{price.eur}</p>
                            <p className="text-[10px] text-ink-400">{price.bgn}</p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(line.productId, line.variant)}
                        className="self-start rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Премахни ${line.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <footer className="shrink-0 border-t border-ink-100 bg-white p-5">
              <div className="flex items-end justify-between">
                <span className="text-sm text-ink-600">Междинна сума</span>
                <div className="text-right">
                  <p className="font-display text-xl font-extrabold">{formatPrice(subtotal).eur}</p>
                  <p className="text-xs text-ink-400">{formatPrice(subtotal).bgn}</p>
                </div>
              </div>
              <p className="mt-1 text-xs text-ink-400">Доставката се изчислява на следващата стъпка.</p>
              <Link
                href="/poruchka"
                onClick={closeCart}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
              >
                Към поръчката
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="mt-2 w-full rounded-full px-6 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-100"
              >
                Продължи пазаруването
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
