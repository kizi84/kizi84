import Link from "next/link";
import { ArrowRight, Quote, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/shop/Hero";
import { TrustBar } from "@/components/shop/TrustBar";
import { CategoryTiles } from "@/components/shop/CategoryTiles";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SectionHeading } from "@/components/shop/SectionHeading";
import { BrandMarquee } from "@/components/shop/BrandMarquee";
import { Reveal } from "@/components/Reveal";
import {
  getFeaturedProducts, getNewProducts, getSaleProducts, getTopCategoriesWithCounts,
} from "@/lib/queries";
import { SITE } from "@/lib/constants";

export const revalidate = 300;

export const metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [categories, featured, newest, sale, brands, reviews] = await Promise.all([
    getTopCategoriesWithCounts(6),
    getFeaturedProducts(8),
    getNewProducts(4),
    getSaleProducts(4),
    prisma.brand.findMany({ take: 14, orderBy: { name: "asc" }, select: { id: true, slug: true, name: true } }),
    prisma.review.findMany({
      where: { status: "approved", rating: { gte: 4 } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { product: { select: { name: true, slug: true } } },
    }),
  ]);

  return (
    <>
      <Hero />
      <TrustBar />

      <section className="container-page py-14 lg:py-20">
        <SectionHeading
          eyebrow="Категории"
          title="Намерете това, от което любимецът Ви има нужда"
          description="От суха храна и лакомства до нашийници от естествена кожа — подредено така, че да намерите всичко за секунди."
          href="/katalog"
          linkLabel="Целият каталог"
        />
        <CategoryTiles categories={categories} />
      </section>

      {featured.length > 0 && (
        <section className="container-page pb-14 lg:pb-20">
          <SectionHeading
            eyebrow="Избрани"
            title="Най-търсените при нас"
            description="Продуктите, които клиентите ни поръчват отново и отново."
            href="/katalog"
          />
          <ProductGrid products={featured} priorityCount={4} />
        </section>
      )}

      {sale.length > 0 && (
        <section className="bg-white py-14 lg:py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="Промоции"
              title="🔥 Актуални намаления"
              description="Ограничени количества на специални цени."
              href="/promocii"
            />
            <ProductGrid products={sale} />
          </div>
        </section>
      )}

      <BrandMarquee brands={brands} />

      {/* Leather craftsmanship story — the shop's real differentiator. */}
      <section className="container-page py-14 lg:py-20">
        <div className="overflow-hidden rounded-[2rem] bg-ink-900">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-14">
              <Reveal>
                <p className="text-xs font-bold tracking-wider text-amber-brand-400 uppercase">
                  Собствено производство
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold text-white lg:text-4xl">
                  Кожени аксесоари, които издържат цял живот
                </h2>
                <p className="mt-5 leading-relaxed text-ink-300">
                  Ние сме първият български производител на кучешки аксесоари от естествена
                  кожа. Всеки нашийник и повод се изработва ръчно от подбрана телешка кожа,
                  с шевове и обков, които издържат на ежедневно натоварване.
                </p>

                <ul className="mt-7 space-y-3">
                  {[
                    "Естествена телешка кожа, обработена в България",
                    "Ръчна изработка и двойни шевове",
                    "Усилени катарами и обков без ръжда",
                    "Размери за всяка порода — от чихуахуа до кангал",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ink-200">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-brand-400" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/katalog/aksesoari-za-kucheta"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-amber-brand-400 px-7 py-3.5 font-semibold text-ink-900 transition-all hover:bg-amber-brand-300 active:scale-95"
                >
                  Разгледай кожените аксесоари
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </Reveal>
            </div>

            <div className="relative min-h-64 bg-gradient-to-br from-amber-brand-600 to-amber-brand-700 lg:min-h-full">
              <span aria-hidden className="absolute inset-0 grid place-items-center text-[12rem] opacity-25 select-none">
                🦴
              </span>
            </div>
          </div>
        </div>
      </section>

      {newest.length > 0 && (
        <section className="container-page pb-14 lg:pb-20">
          <SectionHeading
            eyebrow="Новo"
            title="Последно добавени"
            href="/katalog?sort=new"
          />
          <ProductGrid products={newest} />
        </section>
      )}

      {reviews.length > 0 && (
        <section className="bg-white py-14 lg:py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Отзиви" title="Какво казват клиентите ни" />
            <div className="grid gap-5 lg:grid-cols-3">
              {reviews.map((review, index) => (
                <Reveal key={review.id} delay={index * 90}>
                  <figure className="flex h-full flex-col rounded-2xl border border-ink-100 bg-cream p-6">
                    <Quote className="size-7 text-brand-200" aria-hidden />
                    <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-700">
                      „{review.body}“
                    </blockquote>
                    <figcaption className="mt-5 border-t border-ink-200 pt-4">
                      <div className="flex" aria-label={`Оценка ${review.rating} от 5`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            aria-hidden
                            className={
                              n <= review.rating
                                ? "size-3.5 fill-amber-brand-400 text-amber-brand-400"
                                : "size-3.5 text-ink-200"
                            }
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm font-bold text-ink-900">{review.authorName}</p>
                      <Link
                        href={`/produkt/${review.product.slug}`}
                        className="link-underline text-xs text-ink-500 hover:text-brand-700"
                      >
                        {review.product.name}
                      </Link>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page py-14 lg:py-20">
        <Reveal className="rounded-[2rem] bg-brand-600 px-8 py-12 text-center sm:px-12 lg:py-16">
          <h2 className="font-display text-3xl font-extrabold text-white lg:text-4xl">
            Не сте сигурни коя храна е подходяща?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-brand-100">
            Обадете ни се или минете през магазин във Варна — ще Ви помогнем да изберете
            според породата, възрастта и нуждите на Вашия любимец.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="rounded-full bg-white px-7 py-3.5 font-semibold text-brand-700 transition-transform hover:scale-105 active:scale-95"
            >
              {SITE.phone}
            </a>
            <Link
              href="/kontakti"
              className="rounded-full border border-brand-400 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Магазини и контакти
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
