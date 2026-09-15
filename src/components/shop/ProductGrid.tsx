import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/Reveal";
import type { ProductCardData } from "@/lib/queries";

export function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: ProductCardData[];
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {products.map((product, index) => (
        <Reveal key={product.id} delay={Math.min(index, 7) * 60}>
          <ProductCard product={product} priority={index < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
