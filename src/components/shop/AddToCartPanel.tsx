"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { cn, formatPrice, type Variant } from "@/lib/utils";

export function AddToCartPanel({
  product,
  variants,
  image,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    stock: number;
    trackStock: boolean;
  };
  variants: Variant[];
  image: string | null;
}) {
  const { add, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  // Preselect the cheapest variant so the price matches the "от …" shown on cards.
  const [variantIndex, setVariantIndex] = useState(() => {
    let best = 0;
    let bestPrice = Infinity;
    variants.forEach((variant, index) => {
      const value = variant.price ?? product.price;
      if (value < bestPrice) {
        bestPrice = value;
        best = index;
      }
    });
    return best;
  });
  const [added, setAdded] = useState(false);

  const selected = variants[variantIndex];
  const price = selected?.price ?? product.price;
  const stock = selected?.stock ?? product.stock;
  const inStock = !product.trackStock || stock > 0;
  const cap = product.trackStock ? Math.max(stock, 1) : 99;
  const display = formatPrice(price);

  function handleAdd() {
    if (!inStock) return;
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price,
        image,
        variant: selected?.label ?? null,
        maxStock: product.trackStock ? stock : 99,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 lg:p-6">
      <div className="flex items-end gap-3">
        <p className="font-display text-3xl font-extrabold text-ink-900">{display.eur}</p>
        <p className="pb-1 text-sm text-ink-400">{display.bgn}</p>
      </div>

      <p className={cn("mt-2 text-sm font-medium", inStock ? "text-emerald-600" : "text-rose-600")}>
        {inStock
          ? product.trackStock
            ? `В наличност — ${stock} бр.`
            : "В наличност"
          : "Временно изчерпан"}
      </p>

      {variants.length > 0 && (
        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-ink-900">Изберете вариант</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {variants.map((variant, index) => (
              <button
                key={variant.label}
                type="button"
                onClick={() => setVariantIndex(index)}
                aria-pressed={index === variantIndex}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  index === variantIndex
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-700 hover:border-brand-300",
                )}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex gap-3">
        <div className="flex items-center rounded-full border border-ink-200 bg-cream">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center rounded-full text-ink-700 hover:bg-ink-100"
            aria-label="Намали количеството"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-9 text-center font-semibold tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(cap, q + 1))}
            className="grid size-11 place-items-center rounded-full text-ink-700 hover:bg-ink-100 disabled:opacity-30"
            disabled={quantity >= cap}
            aria-label="Увеличи количеството"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-white transition-all active:scale-[0.98]",
            added ? "bg-emerald-500" : "bg-brand-600 hover:bg-brand-700",
            !inStock && "cursor-not-allowed bg-ink-300 hover:bg-ink-300",
          )}
        >
          {added ? (
            <><Check className="size-5" aria-hidden /> Добавено</>
          ) : (
            <><ShoppingBag className="size-5" aria-hidden /> Добави в количката</>
          )}
        </button>
      </div>

      {added && (
        <button
          type="button"
          onClick={openCart}
          className="mt-3 w-full rounded-full border border-ink-200 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          Виж количката
        </button>
      )}

      <p className="mt-4 text-center text-xs text-ink-400">
        Безплатна доставка над 51,13 € ·{" "}
        <Link href="/dostavka" className="link-underline text-brand-700">Условия за доставка</Link>
      </p>
    </div>
  );
}
