"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Variant } from "@/lib/utils";

/**
 * Optional size/weight options (e.g. "3 кг", "12 кг"). Leaving the list empty
 * keeps the product on its single base price.
 */
export function VariantEditor({
  name = "variants",
  initial = [],
}: {
  name?: string;
  initial?: Variant[];
}) {
  const [variants, setVariants] = useState<Variant[]>(initial);

  function update(index: number, patch: Partial<Variant>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  return (
    <div>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          variants
            .filter((v) => v.label.trim() !== "")
            .map((v) => ({
              label: v.label.trim(),
              ...(v.price != null && Number.isFinite(v.price) ? { price: v.price } : {}),
              ...(v.sku ? { sku: v.sku } : {}),
              ...(v.stock != null && Number.isFinite(v.stock) ? { stock: v.stock } : {}),
            })),
        )}
      />

      {variants.length > 0 && (
        <ul className="mb-3 space-y-2">
          {variants.map((variant, index) => (
            <li key={index} className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-200 bg-cream p-2.5">
              <input
                value={variant.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="Вариант (напр. 12 кг)"
                aria-label="Име на варианта"
                className="min-w-32 flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                min={0}
                value={variant.price ?? ""}
                onChange={(e) =>
                  update(index, { price: e.target.value === "" ? undefined : Number(e.target.value) })
                }
                placeholder="Цена €"
                aria-label="Цена на варианта"
                className="w-28 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
              <input
                type="number"
                min={0}
                value={variant.stock ?? ""}
                onChange={(e) =>
                  update(index, { stock: e.target.value === "" ? undefined : Number(e.target.value) })
                }
                placeholder="Бройки"
                aria-label="Наличност на варианта"
                className="w-24 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                className="grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Премахни варианта"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setVariants((prev) => [...prev, { label: "" }])}
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
      >
        <Plus className="size-4" aria-hidden />
        Добави вариант
      </button>
    </div>
  );
}
