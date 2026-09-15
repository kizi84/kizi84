import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { CatalogShell } from "@/components/shop/CatalogShell";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import { EmptyState } from "@/components/shop/EmptyState";
import { SearchBox } from "@/components/shop/SearchBox";
import { getFilterBrands, getPriceBounds, queryCatalog, type CatalogSearchParams } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Търсене",
  description: "Търсете сред всички продукти на Uzunov 90 — храни, аксесоари и играчки за кучета и котки.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams & Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const [{ products, total, page, pageCount }, brands, bounds] = await Promise.all([
    queryCatalog(params),
    getFilterBrands(),
    getPriceBounds(),
  ]);

  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ href: "/tarsene", label: "Търсене" }]} />

      <header className="mt-5 mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">
          {query ? <>Резултати за „{query}“</> : "Търсене"}
        </h1>
        <div className="mt-5 max-w-xl">
          <SearchBox initialQuery={query} />
        </div>
      </header>

      {query === "" ? (
        <EmptyState
          title="Какво търсите?"
          description="Въведете име на продукт, марка или категория в полето по-горе."
          actionHref="/katalog"
          actionLabel="Разгледай каталога"
        />
      ) : (
        <CatalogShell brands={brands} bounds={bounds} total={total}>
          {products.length === 0 ? (
            <EmptyState
              title="Няма намерени резултати"
              description={`Не открихме продукти за „${query}“. Опитайте с друга дума или разгледайте каталога.`}
              actionHref="/katalog"
              actionLabel="Към каталога"
            />
          ) : (
            <>
              <ProductGrid products={products} priorityCount={4} />
              <Pagination page={page} pageCount={pageCount} basePath="/tarsene" searchParams={params} />
            </>
          )}
        </CatalogShell>
      )}
    </div>
  );
}
