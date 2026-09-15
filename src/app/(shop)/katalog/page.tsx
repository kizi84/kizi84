import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { CatalogShell } from "@/components/shop/CatalogShell";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import { EmptyState } from "@/components/shop/EmptyState";
import { getFilterBrands, getPriceBounds, queryCatalog, type CatalogSearchParams } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог — всички продукти",
  description:
    "Целият каталог на Uzunov 90: храни, лакомства, аксесоари, играчки и козметика за кучета и котки. Филтрирайте по марка, цена и наличност.",
  alternates: { canonical: "/katalog" },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams & Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const [{ products, total, page, pageCount }, brands, bounds] = await Promise.all([
    queryCatalog(params),
    getFilterBrands(),
    getPriceBounds(),
  ]);

  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ href: "/katalog", label: "Каталог" }]} />

      <header className="mt-5 mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">Каталог</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-600">
          Всичко за кучета и котки на едно място — храни, лакомства, аксесоари и козметика.
        </p>
      </header>

      <CatalogShell brands={brands} bounds={bounds} total={total}>
        {products.length === 0 ? (
          <EmptyState
            title="Няма намерени продукти"
            description="Опитайте с по-малко филтри или разгледайте целия каталог."
            actionHref="/katalog"
            actionLabel="Изчисти филтрите"
          />
        ) : (
          <>
            <ProductGrid products={products} priorityCount={4} />
            <Pagination page={page} pageCount={pageCount} basePath="/katalog" searchParams={params} />
          </>
        )}
      </CatalogShell>
    </div>
  );
}
