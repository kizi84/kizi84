import type { Metadata } from "next";
import { Banknote, Clock, MapPin, Package, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Доставка и плащане",
  description:
    "Условия за доставка на Uzunov 90: безплатна доставка над 51,13 € за страната и над 25,56 € за Варна. Наложен платеж или банков превод.",
  alternates: { canonical: "/dostavka" },
};

const options = [
  {
    icon: MapPin,
    title: "Доставка в град Варна",
    price: "Безплатно над 25,56 € (50 лв.)",
    text: "За поръчки над 25,56 € с тегло до 3 кг доставката в рамките на град Варна е за наша сметка.",
  },
  {
    icon: Truck,
    title: "Доставка до офис на Speedy",
    price: "Безплатно над 51,13 € (100 лв.)",
    text: "За поръчки над 51,13 € с тегло до 3 кг доставката до офис на Speedy в цялата страна е безплатна.",
  },
  {
    icon: Package,
    title: "Доставка до адрес",
    price: "По тарифа на куриера",
    text: "Доставка до посочен от Вас адрес в цялата страна. Свържете се с нас за точна цена според теглото.",
  },
];

export default function DeliveryPage() {
  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ href: "/dostavka", label: "Доставка" }]} />

      <header className="mt-5 mb-10">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">
          Доставка и плащане
        </h1>
        <p className="mt-3 max-w-2xl text-ink-600">
          Изпращаме поръчките в рамките на 1 работен ден. Доставката се извършва
          от куриерска фирма Speedy до офис или до адрес в цялата страна.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {options.map((option, index) => (
          <Reveal key={option.title} delay={index * 90}>
            <div className="h-full rounded-2xl border border-ink-100 bg-white p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <option.icon className="size-6" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900">{option.title}</h2>
              <p className="mt-1.5 text-sm font-semibold text-brand-700">{option.price}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{option.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <section className="h-full rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-900">
              <Banknote className="size-5 text-brand-600" aria-hidden />
              Начини на плащане
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                <span>
                  <strong className="text-ink-900">Наложен платеж</strong> — плащате в брой на
                  куриера при получаване на пратката.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                <span>
                  <strong className="text-ink-900">Банков превод</strong> — след потвърждение на
                  поръчката Ви изпращаме проформа фактура с банковите ни данни.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                <span>
                  <strong className="text-ink-900">В магазина</strong> — при вземане на поръчката
                  от някой от магазините ни във Варна.
                </span>
              </li>
            </ul>
            <p className="mt-5 rounded-xl bg-cream p-4 text-xs text-ink-500">
              Всички цени са в евро с включен ДДС. Фиксиран курс: 1 € = 1,95583 лв.
            </p>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="h-full rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-900">
              <Clock className="size-5 text-brand-600" aria-hidden />
              Срокове и вземане от магазин
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                Обработваме поръчките в рамките на 1 работен ден.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                Доставката отнема 1–3 работни дни в зависимост от населеното място.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                Може да вземете поръчката си без такса от магазините ни във Варна.
              </li>
            </ul>

            <div className="mt-5 space-y-3">
              {SITE.locations.slice(0, 2).map((loc) => (
                <div key={loc.address} className="rounded-xl bg-cream p-4">
                  <p className="text-sm font-bold text-ink-900">{loc.name}</p>
                  <p className="text-sm text-ink-600">{loc.address}, {loc.city}</p>
                  <p className="mt-1 text-xs text-ink-500">{loc.hours}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
