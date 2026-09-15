import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs, type Crumb } from "@/components/shop/Breadcrumbs";
import { CatalogShell } from "@/components/shop/CatalogShell";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import { EmptyState } from "@/components/shop/EmptyState";
import { getCategoryWithDescendantIds } from "@/lib/queries";
import { getFilterBrands, getPriceBounds, queryCatalog, type CatalogSearchParams } from "@/lib/catalog";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
    take: 100,
  });
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Категорията не е намерена" };

  const title = category.seoTitle || category.name;
  const description =
    category.seoDescription ||
    category.description ||
    `${category.name} — разгледайте нашата селекция в Uzunov 90. Доставка до цялата страна.`;

  return {
    title,
    description,
    alternates: { canonical: `/katalog/${category.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams & Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);

  const result = await getCategoryWithDescendantIds(slug);
  if (!result || !result.category.isActive) notFound();

  const { category, categoryIds } = result;
  const scope = { categoryId: { in: categoryIds } };

  const [{ products, total, page, pageCount }, brands, bounds] = await Promise.all([
    queryCatalog(search, scope),
    getFilterBrands(scope),
    getPriceBounds(scope),
  ]);

  const crumbs: Crumb[] = [{ href: "/katalog", label: "Каталог" }];
  if (category.parent) {
    crumbs.push({ href: `/katalog/${category.parent.slug}`, label: category.parent.name });
  }
  crumbs.push({ href: `/katalog/${category.slug}`, label: category.name });

  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={crumbs} />

      <header className="mt-5 mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">
          {category.icon && <span className="mr-2.5" aria-hidden>{category.icon}</span>}
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600">{category.description}</p>
        )}

        {category.children.length > 0 && (
          <ul className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
            {category.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/katalog/${child.slug}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {child.icon && <span aria-hidden>{child.icon}</span>}
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <CatalogShell brands={brands} bounds={bounds} total={total}>
        {products.length === 0 ? (
          <EmptyState
            title="Няма продукти в тази категория"
            description="Скоро добавяме нови артикули. Разгледайте останалата част от каталога."
            actionHref="/katalog"
            actionLabel="Към каталога"
          />
        ) : (
          <>
            <ProductGrid products={products} priorityCount={4} />
            <Pagination
              page={page}
              pageCount={pageCount}
              basePath={`/katalog/${category.slug}`}
              searchParams={search}
            />
          </>
        )}
      </CatalogShell>
    </div>
  );
}
