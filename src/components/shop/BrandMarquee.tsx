import Link from "next/link";

/** Infinite CSS marquee — the list is duplicated so the loop has no seam. */
export function BrandMarquee({ brands }: { brands: { id: string; slug: string; name: string }[] }) {
  if (brands.length === 0) return null;
  const loop = [...brands, ...brands];

  return (
    <section className="overflow-hidden border-y border-ink-100 bg-white py-8">
      <p className="container-page mb-5 text-center text-xs font-bold tracking-wider text-ink-400 uppercase">
        Марките, на които вярваме
      </p>
      <div className="group relative flex overflow-hidden">
        <div className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]">
          {loop.map((brand, index) => (
            <Link
              key={`${brand.id}-${index}`}
              href={`/marki/${brand.slug}`}
              aria-hidden={index >= brands.length}
              tabIndex={index >= brands.length ? -1 : 0}
              className="shrink-0 rounded-full border border-ink-100 bg-cream px-6 py-2.5 font-display text-sm font-bold whitespace-nowrap text-ink-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
