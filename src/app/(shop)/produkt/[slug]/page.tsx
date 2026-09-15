import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs, type Crumb } from "@/components/shop/Breadcrumbs";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AddToCartPanel } from "@/components/shop/AddToCartPanel";
import { ReviewSection } from "@/components/shop/ReviewSection";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SectionHeading } from "@/components/shop/SectionHeading";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { parseImages, parseVariants } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export const revalidate = 120;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { soldCount: "desc" },
    select: { slug: true },
    take: 200,
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true, shortDescription: true, description: true, images: true,
      seoTitle: true, seoDescription: true, brand: { select: { name: true } },
    },
  });
  if (!product) return { title: "Продуктът не е намерен" };

  const title = product.seoTitle || product.name;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    `${product.name} — купете онлайн от Uzunov 90.`;

  const images = parseImages(product.images);

  return {
    title,
    description,
    alternates: { canonical: `/produkt/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: images.length > 0 ? [{ url: images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  const images = parseImages(product.images);
  const variants = parseVariants(product.variants);
  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  // Fire-and-forget view counter — never block rendering on it.
  prisma.product
    .update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const crumbs: Crumb[] = [{ href: "/katalog", label: "Каталог" }];
  if (product.category?.parent) {
    crumbs.push({ href: `/katalog/${product.category.parent.slug}`, label: product.category.parent.name });
  }
  if (product.category) {
    crumbs.push({ href: `/katalog/${product.category.slug}`, label: product.category.name });
  }
  crumbs.push({ href: `/produkt/${product.slug}`, label: product.name });

  const inStock = !product.trackStock || product.stock > 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || product.name,
    image: images.map((img) => (img.startsWith("http") ? img : `${SITE.url}${img}`)),
    sku: product.sku || product.id,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/produkt/${product.slug}`,
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE.legalName },
    },
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratingAvg,
        reviewCount: product.ratingCount,
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <div className="container-page py-8 lg:py-12">
        <Breadcrumbs items={crumbs} />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={images} name={product.name} />

          <div>
            {product.brand && (
              <Link
                href={`/marki/${product.brand.slug}`}
                className="link-underline text-xs font-bold tracking-wider text-brand-600 uppercase"
              >
                {product.brand.name}
              </Link>
            )}

            <h1 className="mt-2 font-display text-2xl font-extrabold text-ink-900 lg:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-500">
              {product.sku && <span>Код: <strong className="text-ink-700">{product.sku}</strong></span>}
              {product.ratingCount > 0 && (
                <a href="#otzivi" className="link-underline text-brand-700">
                  ★ {product.ratingAvg.toFixed(1)} ({product.ratingCount} отзива)
                </a>
              )}
            </div>

            {product.shortDescription && (
              <p className="mt-5 leading-relaxed text-ink-600">{product.shortDescription}</p>
            )}

            <div className="mt-6">
              <AddToCartPanel
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  stock: product.stock,
                  trackStock: product.trackStock,
                }}
                variants={variants}
                image={images[0] ?? null}
              />
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Truck, text: "Доставка 1–3 работни дни" },
                { icon: ShieldCheck, text: "Оригинален продукт" },
                { icon: RotateCcw, text: "Връщане до 14 дни" },
                { icon: Package, text: "Грижливо опакована пратка" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2.5 text-xs text-ink-600">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600">
                    <item.icon className="size-4" aria-hidden />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {product.description && (
          <section className="mt-14 lg:mt-20">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">Описание</h2>
            <div className="mt-4 max-w-3xl rounded-2xl border border-ink-100 bg-white p-6 text-sm leading-relaxed whitespace-pre-line text-ink-700 lg:text-base">
              {product.description}
            </div>
          </section>
        )}

        <div className="mt-14 lg:mt-20">
          <ReviewSection
            productId={product.id}
            reviews={product.reviews}
            ratingAvg={product.ratingAvg}
            ratingCount={product.ratingCount}
          />
        </div>

        {related.length > 0 && (
          <section className="mt-14 lg:mt-20">
            <SectionHeading eyebrow="Още от категорията" title="Може да Ви хареса" />
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </>
  );
}
