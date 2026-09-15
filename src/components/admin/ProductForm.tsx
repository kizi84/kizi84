"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { saveProduct, type ActionResult } from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { VariantEditor } from "@/components/admin/VariantEditor";
import { Card, Field, Select, TextArea, Toggle } from "@/components/admin/ui";
import type { Variant } from "@/lib/utils";

export type ProductFormValues = {
  id?: string;
  name?: string;
  slug?: string | null;
  sku?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  price?: number;
  oldPrice?: number | null;
  stock?: number;
  trackStock?: boolean;
  unit?: string;
  weight?: number | null;
  images?: string[];
  variants?: Variant[];
  categoryId?: string | null;
  brandId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: ProductFormValues;
  categories: { value: string; label: string }[];
  brands: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const isEdit = Boolean(product?.id);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError("");
    setSaved(false);

    startTransition(async () => {
      const result: ActionResult = await saveProduct(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSaved(true);
      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/admin/produkti/${result.id}`);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-6">
        <Card className="p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">Основна информация</h2>

          <div className="mt-5 space-y-4">
            <Field
              label="Име на продукта *"
              name="name"
              required
              defaultValue={product?.name}
              placeholder="напр. Brit Care Adult Medium Lamb & Rice 12 кг"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Код / SKU"
                name="sku"
                defaultValue={product?.sku}
                placeholder="1153"
                hint="По желание — за вътрешно проследяване."
              />
              <Field
                label="URL адрес (slug)"
                name="slug"
                defaultValue={product?.slug}
                placeholder="оставете празно за автоматичен"
                hint="Генерира се от името, ако е празно."
              />
            </div>

            <TextArea
              label="Кратко описание"
              name="shortDescription"
              rows={2}
              defaultValue={product?.shortDescription}
              placeholder="Едно-две изречения, които се показват до цената."
            />

            <TextArea
              label="Пълно описание"
              name="description"
              rows={9}
              defaultValue={product?.description}
              placeholder="Състав, аналитични съставки, начин на хранене, предназначение…"
            />
          </div>
        </Card>

        <Card className="p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">Снимки</h2>
          <p className="mt-1 mb-4 text-sm text-ink-500">
            Качете една или няколко снимки. Първата се показва в каталога.
          </p>
          <ImageUploader initial={product?.images ?? []} />
        </Card>

        <Card className="p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">Цена и наличност</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label="Цена (€) *"
              name="price"
              type="number"
              step="0.01"
              min={0}
              required
              defaultValue={product?.price}
              placeholder="0.00"
            />
            <Field
              label="Стара цена (€)"
              name="oldPrice"
              type="number"
              step="0.01"
              min={0}
              defaultValue={product?.oldPrice}
              placeholder="0.00"
              hint="Попълнете само при промоция — показва се зачертана."
            />
            <Field
              label="Наличност (бройки)"
              name="stock"
              type="number"
              min={0}
              defaultValue={product?.stock ?? 0}
            />
            <Field
              label="Тегло (кг)"
              name="weight"
              type="number"
              step="0.01"
              min={0}
              defaultValue={product?.weight}
              hint="Използва се за изчисляване на доставката."
            />
          </div>

          <div className="mt-4">
            <Toggle
              label="Следи наличността"
              name="trackStock"
              defaultChecked={product?.trackStock ?? true}
              hint="Изключете за продукти, които винаги са налични."
            />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-ink-900">Варианти (разфасовки)</h3>
            <p className="mt-1 mb-3 text-sm text-ink-500">
              Ако продуктът се предлага в няколко разфасовки, добавете ги тук. Празна цена = основната цена.
            </p>
            <VariantEditor initial={product?.variants ?? []} />
          </div>
        </Card>

        <Card className="p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">SEO</h2>
          <p className="mt-1 mb-4 text-sm text-ink-500">
            По желание — ако са празни, се използват името и краткото описание.
          </p>
          <div className="space-y-4">
            <Field label="SEO заглавие" name="seoTitle" defaultValue={product?.seoTitle} />
            <TextArea label="SEO описание" name="seoDescription" rows={3} defaultValue={product?.seoDescription} />
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6 lg:sticky lg:top-6">
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Публикуване</h2>

          <div className="mt-4 space-y-2.5">
            <Toggle label="Активен" name="isActive" defaultChecked={product?.isActive ?? true} hint="Показва се в сайта." />
            <Toggle label="Избран продукт" name="isFeatured" defaultChecked={product?.isFeatured ?? false} hint="Показва се на началната страница." />
            <Toggle label="Отбележи като нов" name="isNew" defaultChecked={product?.isNew ?? false} hint="Показва етикет „Ново“." />
          </div>

          {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          {saved && !error && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Промените са записани.
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
            {isEdit ? "Запази промените" : "Създай продукта"}
          </button>

          {product?.slug && (
            <Link
              href={`/produkt/${product.slug}`}
              target="_blank"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              <ExternalLink className="size-4" aria-hidden />
              Виж в сайта
            </Link>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Категоризация</h2>
          <div className="mt-4 space-y-4">
            <Select
              label="Категория"
              name="categoryId"
              defaultValue={product?.categoryId}
              options={categories}
              placeholder="— без категория —"
            />
            <Select
              label="Марка"
              name="brandId"
              defaultValue={product?.brandId}
              options={brands}
              placeholder="— без марка —"
            />
            <Field
              label="Мерна единица"
              name="unit"
              defaultValue={product?.unit ?? "бр."}
              placeholder="бр."
            />
          </div>
        </Card>
      </div>
    </form>
  );
}
