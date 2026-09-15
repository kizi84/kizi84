import type { Metadata } from "next";
import Link from "next/link";
import { Award, Heart, Scissors, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "За нас",
  description:
    "Uzunov 90 — над 30 години опит в грижата за домашни любимци и първият български производител на кучешки аксесоари от естествена кожа.",
  alternates: { canonical: "/za-nas" },
};

const values = [
  { icon: Scissors, title: "Собствено производство", text: "Първият български производител на кучешки аксесоари от естествена кожа." },
  { icon: Award, title: "Доказано качество", text: "Работим само с оригинални продукти от проверени производители." },
  { icon: Heart, title: "Истинска грижа", text: "Съветваме честно — препоръчваме това, което е добро за животното." },
  { icon: Users, title: "Семеен бизнес", text: "Три поколения на едно място — познаваме клиентите си по име." },
];

export default function AboutPage() {
  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ href: "/za-nas", label: "За нас" }]} />

      <header className="mt-5 mb-12 max-w-3xl">
        <p className="text-xs font-bold tracking-wider text-brand-600 uppercase">От 1990 година</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-900 lg:text-5xl">
          Магазин, създаден от хора, които наистина обичат животните
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-600">
          {SITE.legalName} започна като малък семеен магазин във Варна. Днес имаме два
          обекта в града, складова база в с. Кичево и онлайн магазин, който обслужва
          клиенти в цялата страна — но подходът ни не се е променил.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value, index) => (
          <Reveal key={value.title} delay={index * 80}>
            <div className="h-full rounded-2xl border border-ink-100 bg-white p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <value.icon className="size-6" aria-hidden />
              </span>
              <h2 className="mt-4 font-display font-bold text-ink-900">{value.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{value.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <section className="overflow-hidden rounded-[2rem] bg-ink-900 p-8 sm:p-12 lg:p-14">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-extrabold text-white lg:text-3xl">
              Кожарският занаят зад марката
            </h2>
            <p className="mt-5 leading-relaxed text-ink-300">
              Всеки нашийник, повод и намордник, който излиза от работилницата ни, е
              направен от естествена телешка кожа, обработена в България. Използваме
              двойни шевове, усилени катарами и обков, който не ръждясва — затова
              нашите аксесоари служат години, а не сезони.
            </p>
            <p className="mt-4 leading-relaxed text-ink-300">
              Предлагаме размери за всяка порода — от най-дребните до най-едрите
              работни кучета — а при нужда изработваме и по поръчка.
            </p>
            <Link
              href="/kontakti"
              className="mt-8 inline-block rounded-full bg-amber-brand-400 px-7 py-3.5 font-semibold text-ink-900 transition-colors hover:bg-amber-brand-300"
            >
              Свържете се с нас
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
