import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import { EmptyState } from "@/components/shop/EmptyState";
import { queryCatalog, type CatalogSearchParams } from "@/lib/catalog";

export const revalidate = 300;

export async function generateStaticParams() {
  const brands = await prisma.brand.findMany({ select: { slug: true }, take: 100 });
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) return { title: "Марката не е намерена" };

  return {
    title: `${brand.name} — храни и аксесоари`,
    description:
      brand.description ||
      `Продукти на ${brand.name} в Uzunov 90 — оригинални артикули с доставка до цялата страна.`,
    alternates: { canonical: `/marki/${brand.slug}` },
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams & Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);

  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) notFound();

  const { products, total, page, pageCount } = await queryCatalog(search, { brandId: brand.id });

  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs
        items={[{ href: "/marki", label: "Марки" }, { href: `/marki/${brand.slug}`, label: brand.name }]}
      />

      <header className="mt-5 mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">{brand.name}</h1>
        {brand.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600">{brand.description}</p>
        )}
        <p className="mt-3 text-sm text-ink-500">{total} продукта</p>
      </header>

      {products.length === 0 ? (
        <EmptyState
          title="Няма продукти от тази марка"
          description="Скоро добавяме нови артикули."
          actionHref="/katalog"
          actionLabel="Към каталога"
        />
      ) : (
        <>
          <ProductGrid products={products} priorityCount={4} />
          <Pagination
            page={page}
            pageCount={pageCount}
            basePath={`/marki/${brand.slug}`}
            searchParams={search}
          />
        </>
      )}
    </div>
  );
}
