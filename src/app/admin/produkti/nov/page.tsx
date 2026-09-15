import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { getBrandOptions, getCategoryOptions } from "@/lib/admin-options";

export const dynamic = "force-dynamic";
export const metadata = { title: "Нов продукт" };

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getCategoryOptions(), getBrandOptions()]);

  return (
    <>
      <Link
        href="/admin/produkti"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Обратно към продуктите
      </Link>

      <PageHeader title="Нов продукт" description="Попълнете информацията и качете снимки." />

      <ProductForm categories={categories} brands={brands} />
    </>
  );
}
