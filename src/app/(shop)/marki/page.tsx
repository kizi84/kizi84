import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Reveal } from "@/components/Reveal";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Марки",
  description:
    "Всички марки храни и аксесоари за домашни любимци, които предлагаме в Uzunov 90.",
  alternates: { canonical: "/marki" },
};

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true, slug: true, name: true, description: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ href: "/marki", label: "Марки" }]} />

      <header className="mt-5 mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">Марки</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-600">
          Работим само с доказани производители — оригинални продукти с проследим произход.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand, index) => (
          <Reveal key={brand.id} delay={Math.min(index, 7) * 50}>
            <Link
              href={`/marki/${brand.slug}`}
              className="card-hover flex h-full flex-col justify-between rounded-2xl border border-ink-100 bg-white p-5"
            >
              <span className="font-display text-lg font-extrabold text-ink-900">{brand.name}</span>
              <span className="mt-3 text-xs text-ink-400">{brand._count.products} продукта</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
