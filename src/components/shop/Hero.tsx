import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Soft organic background shapes — pure CSS, no image weight. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 size-[28rem] rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute top-40 -left-32 size-[22rem] rounded-full bg-amber-brand-100/60 blur-3xl" />
      </div>

      <div className="container-page relative py-14 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700">
                <Sparkles className="size-3.5" aria-hidden />
                Над 30 години грижа за домашните любимци
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-5 font-display text-4xl leading-[1.05] font-extrabold text-ink-900 sm:text-5xl lg:text-6xl">
                Всичко за Вашето{" "}
                <span className="relative inline-block text-brand-600">
                  куче и котка
                  <svg
                    className="absolute -bottom-1 left-0 w-full text-amber-brand-400"
                    viewBox="0 0 200 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 9C40 3 80 2 198 6"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-600 lg:text-lg">
                Качествени храни, лакомства и аксесоари на достъпни цени.
                Единственият български производител на кучешки аксесоари от
                <strong className="font-semibold text-ink-800"> естествена кожа</strong>.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/katalog"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-lift active:scale-95"
                >
                  Разгледай каталога
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
                <Link
                  href="/promocii"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-7 py-3.5 font-semibold text-ink-800 transition-all hover:border-ink-300 hover:bg-ink-50 active:scale-95"
                >
                  🔥 Промоции
                </Link>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-ink-200 pt-6">
                {[
                  { value: "3 000+", label: "продукта" },
                  { value: "30+", label: "години опит" },
                  { value: "2", label: "магазина във Варна" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-2xl font-extrabold text-ink-900 lg:text-3xl">
                      {stat.value}
                    </dt>
                    <dd className="text-xs text-ink-500">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={200} className="lg:col-span-6">
            <div className="relative">
              <div className="relative aspect-4/3 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 shadow-lift">
                <div aria-hidden className="absolute inset-0 grid place-items-center text-[14rem] opacity-20 select-none">
                  🐕
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/70 to-transparent p-7">
                  <p className="font-display text-xl font-bold text-white">
                    Кожени нашийници и поводи
                  </p>
                  <p className="mt-1 text-sm text-brand-100">
                    Ръчна изработка от естествена телешка кожа
                  </p>
                </div>
              </div>

              {/* Floating trust cards */}
              <div className="absolute -bottom-5 -left-3 flex items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-3.5 shadow-lift sm:-left-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Truck className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Безплатна доставка</p>
                  <p className="text-[11px] text-ink-500">при поръчка над 51,13 €</p>
                </div>
              </div>

              <div className="absolute -top-4 -right-2 hidden items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-3.5 shadow-lift sm:flex lg:-right-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-brand-50 text-amber-brand-500">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Оригинални марки</p>
                  <p className="text-[11px] text-ink-500">с гаранция за качество</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
