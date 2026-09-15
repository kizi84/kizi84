import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ContactForm } from "@/components/shop/ContactForm";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Контакти",
  description:
    "Свържете се с Uzunov 90 — магазини във Варна на ул. „Братя Миладинови“ 144 и бул. „8-ми Приморски полк“ 202. Телефон, имейл и форма за запитване.",
  alternates: { canonical: "/kontakti" },
};

export default function ContactPage() {
  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ href: "/kontakti", label: "Контакти" }]} />

      <header className="mt-5 mb-10">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">Контакти</h1>
        <p className="mt-3 max-w-2xl text-ink-600">
          Имате въпрос за продукт или поръчка? Пишете ни или минете през някой от магазините ни във Варна.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <Reveal>
            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              <h2 className="font-display text-lg font-bold text-ink-900">Директен контакт</h2>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 text-ink-700 hover:text-brand-700"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Phone className="size-4.5" aria-hidden />
                    </span>
                    <span className="font-semibold">{SITE.phone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="flex items-center gap-3 text-ink-700 hover:text-brand-700"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Mail className="size-4.5" aria-hidden />
                    </span>
                    <span className="font-semibold">{SITE.email}</span>
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>

          {SITE.locations.map((loc, index) => (
            <Reveal key={loc.address} delay={(index + 1) * 90}>
              <div className="rounded-2xl border border-ink-100 bg-white p-6">
                <h2 className="font-display text-lg font-bold text-ink-900">{loc.name}</h2>
                <p className="mt-3 flex items-start gap-3 text-sm text-ink-600">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {loc.address}, {loc.city}
                </p>
                <p className="mt-2 flex items-start gap-3 text-sm text-ink-600">
                  <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {loc.hours}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.address}, ${loc.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-3 inline-block text-sm font-semibold text-brand-700"
                >
                  Виж на картата →
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}
