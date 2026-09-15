import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { EmptyState } from "@/components/shop/EmptyState";
import { PRODUCT_CARD_SELECT } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Промоции и намаления",
  description:
    "Актуални промоции в Uzunov 90 — намалени храни, лакомства и аксесоари за кучета и котки. Ограничени количества.",
  alternates: { canonical: "/promocii" },
};

export default async function PromotionsPage() {
  const candidates = await prisma.product.findMany({
    where: { isActive: true, oldPrice: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: PRODUCT_CARD_SELECT,
  });

  // SQLite can't compare two columns in a WHERE clause, so filter here.
  const products = candidates.filter((p) => p.oldPrice !== null && p.oldPrice > p.price);

  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ href: "/promocii", label: "Промоции" }]} />

      <header className="mt-5 mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-brand-400 to-amber-brand-600 px-8 py-12 text-center lg:py-16">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 lg:text-5xl">
          🔥 Промоции
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink-800 lg:text-base">
          Подбрани продукти на специални цени. Количествата са ограничени.
        </p>
        <p className="mt-4 inline-block rounded-full bg-ink-900/10 px-4 py-1.5 text-sm font-semibold text-ink-900">
          {products.length} промо продукта
        </p>
      </header>

      {products.length === 0 ? (
        <EmptyState
          title="В момента няма активни промоции"
          description="Проверете отново скоро или разгледайте целия каталог."
          actionHref="/katalog"
          actionLabel="Към каталога"
        />
      ) : (
        <ProductGrid products={products} priorityCount={4} />
      )}
    </div>
  );
}
