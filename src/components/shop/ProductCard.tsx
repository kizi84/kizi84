"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Check, Plus, Settings2, Star } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { cn, discountPercent, formatPrice, parseImages, parseVariants } from "@/lib/utils";
import type { ProductCardData } from "@/lib/queries";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const images = parseImages(product.images);
  const image = images[0] ?? null;
  const variants = parseVariants(product.variants);

  // With variants the customer has to pick one, so the card advertises the
  // cheapest option ("от …") and sends them to the product page to choose.
  const variantPrices = variants
    .map((v) => v.price)
    .filter((p): p is number => typeof p === "number" && Number.isFinite(p));

  const hasChoice = variants.length > 0;
  const displayPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.price;

  const price = formatPrice(displayPrice);
  const discount = discountPercent(product.price, product.oldPrice);
  const inStock = !product.trackStock || product.stock > 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image,
      variant: null,
      maxStock: product.trackStock ? product.stock : 99,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <article className="group card-hover relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <Link href={`/produkt/${product.slug}`} className="relative block aspect-square overflow-hidden bg-cream-dark">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center text-5xl opacity-40" aria-hidden>🐾</span>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount !== null && !hasChoice && (
            <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
              −{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
              Ново
            </span>
          )}
          {!inStock && (
            <span className="rounded-full bg-ink-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
              Изчерпан
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <p className="text-[11px] font-semibold tracking-wide text-brand-600 uppercase">
            {product.brand.name}
          </p>
        )}

        <h3 className="mt-1 line-clamp-2 text-sm leading-snug font-semibold text-ink-900">
          <Link href={`/produkt/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>

        {product.ratingCount > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex" aria-hidden>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    "size-3",
                    n <= Math.round(product.ratingAvg)
                      ? "fill-amber-brand-400 text-amber-brand-400"
                      : "text-ink-200",
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-ink-400">({product.ratingCount})</span>
            <span className="sr-only">Оценка {product.ratingAvg} от 5</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {product.oldPrice !== null && product.oldPrice > product.price && !hasChoice && (
              <p className="text-xs text-ink-400 line-through">{formatPrice(product.oldPrice).eur}</p>
            )}
            <p className="font-display text-lg leading-tight font-extrabold text-ink-900">
              {hasChoice && <span className="text-xs font-semibold text-ink-500">от </span>}
              {price.eur}
            </p>
            <p className="text-[10px] text-ink-400">{price.bgn}</p>
          </div>

          {hasChoice ? (
            <Link
              href={`/produkt/${product.slug}`}
              className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-all hover:bg-brand-600 hover:text-white active:scale-90"
              aria-label={`Избери вариант на ${product.name}`}
              title="Избери вариант"
            >
              <Settings2 className="size-4.5" aria-hidden />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inStock}
              className={cn(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full transition-all active:scale-90",
                justAdded
                  ? "bg-emerald-500 text-white"
                  : "bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white",
                !inStock && "cursor-not-allowed opacity-40 hover:bg-brand-50 hover:text-brand-700",
              )}
              aria-label={`Добави ${product.name} в количката`}
            >
              {justAdded ? <Check className="size-4.5" aria-hidden /> : <Plus className="size-4.5" aria-hidden />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
