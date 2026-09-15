"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Brand = { id: string; slug: string; name: string };

/**
 * The catalogue's two-column shell: filter sidebar, result toolbar and results.
 *
 * It owns the grid rather than being dropped into one by each page. Returning a
 * fragment of three siblings into a caller's grid made the toolbar, the sidebar
 * and the product list fight over the same two tracks, which collapsed the
 * products into the 16rem filter column.
 */
export function CatalogShell({
  brands,
  bounds,
  total,
  children,
}: {
  brands: Brand[];
  bounds: { min: number; max: number };
  total: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeBrands = (params.get("brand") ?? "").split(",").filter(Boolean);
  const [minPrice, setMinPrice] = useState(params.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max") ?? "");

  useEffect(() => {
    setMinPrice(params.get("min") ?? "");
    setMaxPrice(params.get("max") ?? "");
  }, [params]);

  function apply(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page"); // any filter change returns to page 1
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  function toggleBrand(slug: string) {
    const set = new Set(activeBrands);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    apply((next) => {
      if (set.size === 0) next.delete("brand");
      else next.set("brand", [...set].join(","));
    });
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    apply((next) => {
      if (minPrice) next.set("min", minPrice); else next.delete("min");
      if (maxPrice) next.set("max", maxPrice); else next.delete("max");
    });
  }

  const inStockOnly = params.get("stock") === "1";
  const hasFilters = activeBrands.length > 0 || params.has("min") || params.has("max") || inStockOnly;

  function clearAll() {
    apply((next) => {
      next.delete("brand"); next.delete("min"); next.delete("max"); next.delete("stock");
    });
  }

  const panel = (
    <div className="space-y-7">
      <div>
        <h3 className="font-display text-sm font-bold text-ink-900">Наличност</h3>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) =>
              apply((next) => (e.target.checked ? next.set("stock", "1") : next.delete("stock")))
            }
            className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
          />
          Само налични
        </label>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold text-ink-900">
          Цена <span className="font-normal text-ink-400">(€)</span>
        </h3>
        <form onSubmit={applyPrice} className="mt-3 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={String(bounds.min)}
            aria-label="Минимална цена"
            className="w-full min-w-0 rounded-lg border border-ink-200 bg-white px-2.5 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          <span className="text-ink-400" aria-hidden>–</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={String(bounds.max)}
            aria-label="Максимална цена"
            className="w-full min-w-0 rounded-lg border border-ink-200 bg-white px-2.5 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-ink-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-ink-800"
          >
            OK
          </button>
        </form>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold text-ink-900">Марка</h3>
          <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-2">
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-ink-700 hover:bg-ink-50"
              >
                <input
                  type="checkbox"
                  checked={activeBrands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                />
                {brand.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="w-full rounded-full border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          Изчисти филтрите
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-44 rounded-2xl border border-ink-100 bg-white p-5">{panel}</div>
        </aside>

        <div className="min-w-0">
          {/* Toolbar */}
          <div
            className={cn(
              "mb-6 flex flex-wrap items-center justify-between gap-3",
              isPending && "opacity-60",
            )}
          >
            <p className="text-sm text-ink-500">
              <strong className="text-ink-900">{total}</strong> продукта
            </p>

            {/* min-w-0 lets the sort select shrink below its longest option on phones. */}
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 lg:hidden"
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                Филтри
                {hasFilters && <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />}
              </button>

              <label className="sr-only" htmlFor="sort">Подреждане</label>
              <select
                id="sort"
                value={params.get("sort") ?? "popular"}
                onChange={(e) => apply((next) => next.set("sort", e.target.value))}
                className="min-w-0 max-w-full truncate rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 focus:border-brand-400 focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={cn(isPending && "opacity-60 transition-opacity")}>{children}</div>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        className={cn("fixed inset-0 z-[60] lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-cream p-5 transition-transform duration-300 ease-out",
            mobileOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold">Филтри</h2>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 hover:bg-ink-100"
              aria-label="Затвори филтрите"
            >
              <X className="size-5" />
            </button>
          </div>
          {panel}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="mt-6 w-full rounded-full bg-brand-600 py-3.5 font-semibold text-white"
          >
            Покажи {total} продукта
          </button>
        </div>
      </div>
    </>
  );
}
