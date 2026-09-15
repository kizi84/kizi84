import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export type CategoryTile = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  image: string | null;
  _count?: { products: number };
};

export function CategoryTiles({ categories }: { categories: CategoryTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((cat, index) => (
        <Reveal key={cat.id} delay={Math.min(index, 5) * 70}>
          <Link
            href={`/katalog/${cat.slug}`}
            className="card-hover group relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 text-center"
          >
            <span className="absolute top-3 right-3 text-ink-300 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>

            {cat.image ? (
              <span className="relative size-16 overflow-hidden rounded-2xl bg-cream-dark">
                <Image src={cat.image} alt="" fill sizes="64px" className="object-cover" />
              </span>
            ) : (
              <span
                className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-3xl transition-colors duration-300 group-hover:bg-brand-100"
                aria-hidden
              >
                {cat.icon ?? "🐾"}
              </span>
            )}

            <span className="text-sm leading-tight font-semibold text-ink-900">{cat.name}</span>

            {cat._count && (
              <span className="text-[11px] text-ink-400">{cat._count.products} продукта</span>
            )}
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
