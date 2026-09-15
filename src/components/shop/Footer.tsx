import Link from "next/link";
import { Clock, Facebook, Instagram, Mail, MapPin, PawPrint, Phone } from "lucide-react";
import { SITE } from "@/lib/constants";
import { NewsletterForm } from "@/components/shop/NewsletterForm";

const shopLinks = [
  { href: "/katalog", label: "Целият каталог" },
  { href: "/promocii", label: "Промоции" },
  { href: "/katalog?sort=new", label: "Нови продукти" },
  { href: "/marki", label: "Марки" },
];

const infoLinks = [
  { href: "/za-nas", label: "За нас" },
  { href: "/dostavka", label: "Доставка и плащане" },
  { href: "/kontakti", label: "Контакти" },
  { href: "/obshti-usloviya", label: "Общи условия" },
  { href: "/poveritelnost", label: "Поверителност" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-ink-900 text-ink-200">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-500 text-white">
                <PawPrint className="size-6" aria-hidden />
              </span>
              <span>
                <span className="block font-display text-xl leading-none font-extrabold text-white">
                  Uzunov <span className="text-amber-brand-400">90</span>
                </span>
                <span className="block text-[11px] text-ink-400">зоомагазин от 1990</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-400">
              Първият български производител на кучешки аксесоари от естествена кожа.
              Храни, лакомства и аксесоари за кучета и котки — с грижа от три поколения.
            </p>

            <div className="mt-6 flex gap-2">
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid size-10 place-items-center rounded-xl bg-ink-800 text-ink-300 transition-colors hover:bg-brand-600 hover:text-white"
              >
                <Facebook className="size-4.5" aria-hidden />
              </a>
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid size-10 place-items-center rounded-xl bg-ink-800 text-ink-300 transition-colors hover:bg-brand-600 hover:text-white"
              >
                <Instagram className="size-4.5" aria-hidden />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-bold tracking-wide text-white uppercase">Магазин</h3>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm text-ink-400 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-bold tracking-wide text-white uppercase">Информация</h3>
            <ul className="mt-4 space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm text-ink-400 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="font-display text-sm font-bold tracking-wide text-white uppercase">Свържете се с нас</h3>

            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2.5 text-ink-300 hover:text-white"
                >
                  <Phone className="size-4 shrink-0 text-brand-400" aria-hidden />
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2.5 text-ink-300 hover:text-white">
                  <Mail className="size-4 shrink-0 text-brand-400" aria-hidden />
                  {SITE.email}
                </a>
              </li>
              {SITE.locations.slice(0, 2).map((loc) => (
                <li key={loc.address} className="flex items-start gap-2.5 text-ink-400">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden />
                  <span>{loc.address}, {loc.city}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-ink-400">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden />
                <span>Понеделник – Събота: 09:30 – 19:00</span>
              </li>
            </ul>

            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.legalName}. Всички права запазени.</p>
          <p>Цените са в евро с ДДС. Фиксиран курс: 1 € = 1,95583 лв.</p>
        </div>
      </div>
    </footer>
  );
}
