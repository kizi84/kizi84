"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown, LayoutGrid, Menu, Phone, Search, ShoppingBag, X, PawPrint,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type NavCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  children: { id: string; slug: string; name: string }[];
};

/** Sentinel id for the "all categories" panel, which is not a real category. */
const ALL_MENU = "__all__";

export function Header({ categories }: { categories: NavCategory[] }) {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation closes whatever was open.
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/tarsene?q=${encodeURIComponent(q)}`);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement strip */}
      <div className="bg-ink-900 text-ink-100 text-xs sm:text-sm">
        <div className="container-page flex h-9 items-center justify-between gap-4">
          <p className="truncate">
            🚚 Безплатна доставка над <strong className="text-amber-brand-300">51,13 €</strong> за цялата страна
          </p>
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-1.5 whitespace-nowrap hover:text-amber-brand-300 transition-colors sm:flex"
          >
            <Phone className="size-3.5" aria-hidden />
            {SITE.phone}
          </a>
        </div>
      </div>

      <div
        className={cn(
          "border-b border-ink-100 bg-cream/85 backdrop-blur-xl transition-shadow duration-300",
          scrolled && "shadow-soft",
        )}
      >
        <div className="container-page flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 rounded-lg p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
            aria-label="Отвори менюто"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${SITE.name} — начало`}>
            <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-soft lg:size-11">
              <PawPrint className="size-5 lg:size-6" aria-hidden />
            </span>
            <span className="hidden sm:block">
              <span className="block font-display text-lg leading-none font-extrabold tracking-tight text-ink-900 lg:text-xl">
                Uzunov <span className="text-brand-600">90</span>
              </span>
              <span className="block text-[10px] leading-tight text-ink-500 lg:text-[11px]">
                зоомагазин от 1990
              </span>
            </span>
          </Link>

          <form onSubmit={submitSearch} className="relative ml-auto hidden max-w-md flex-1 md:block lg:ml-6">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Търсене на храна, нашийник, играчка…"
              aria-label="Търсене в магазина"
              className="w-full rounded-full border border-ink-200 bg-white py-2.5 pr-4 pl-10 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link
              href="/tarsene"
              className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 md:hidden"
              aria-label="Търсене"
            >
              <Search className="size-5" />
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative flex items-center gap-2 rounded-full bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-95 lg:px-5"
              aria-label={`Количка, ${count} артикула`}
            >
              <ShoppingBag className="size-4.5" aria-hidden />
              <span className="hidden lg:inline">Количка</span>
              {count > 0 && (
                <span className="grid min-w-5 place-items-center rounded-full bg-amber-brand-400 px-1.5 text-[11px] font-bold text-ink-900">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop category bar.
            Ten top categories do not fit on a 1024px screen, so the row shows
            as many as the width allows and "Всички категории" always carries
            the complete tree — nothing is only reachable at one breakpoint. */}
        <nav className="container-page hidden border-t border-ink-100 lg:block" aria-label="Категории">
          <ul className="flex items-stretch gap-0.5">
            {categories.slice(0, 5).map((cat, index) => (
              <li
                key={cat.id}
                className={cn(
                  "relative shrink-0",
                  index === 4 && "hidden xl:block",
                )}
                onMouseEnter={() => { cancelClose(); setOpenMenu(cat.id); }}
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={`/katalog/${cat.slug}`}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap px-2.5 py-3 text-[13px] font-medium text-ink-700 transition-colors hover:text-brand-700 xl:text-sm",
                    openMenu === cat.id && "text-brand-700",
                  )}
                  aria-expanded={cat.children.length > 0 ? openMenu === cat.id : undefined}
                >
                  {cat.icon && <span aria-hidden>{cat.icon}</span>}
                  {cat.name}
                  {cat.children.length > 0 && (
                    <ChevronDown
                      className={cn("size-3.5 transition-transform duration-200", openMenu === cat.id && "rotate-180")}
                      aria-hidden
                    />
                  )}
                </Link>

                {cat.children.length > 0 && (
                  <div
                    className={cn(
                      "absolute top-full z-50 w-64 origin-top rounded-2xl border border-ink-100 bg-white p-2 shadow-lift transition-all duration-200",
                      // The last item opens leftwards so the panel never runs off screen.
                      index >= 3 ? "right-0" : "left-0",
                      openMenu === cat.id
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-1 opacity-0",
                    )}
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    {cat.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/katalog/${child.slug}`}
                        className="block rounded-xl px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}

            <li
              className="relative shrink-0"
              onMouseEnter={() => { cancelClose(); setOpenMenu(ALL_MENU); }}
              onMouseLeave={scheduleClose}
            >
              <Link
                href="/katalog"
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap px-2.5 py-3 text-[13px] font-medium text-ink-700 transition-colors hover:text-brand-700 xl:text-sm",
                  openMenu === ALL_MENU && "text-brand-700",
                )}
                aria-expanded={openMenu === ALL_MENU}
              >
                <LayoutGrid className="size-3.5" aria-hidden />
                Всички категории
                <ChevronDown
                  className={cn("size-3.5 transition-transform duration-200", openMenu === ALL_MENU && "rotate-180")}
                  aria-hidden
                />
              </Link>

              <div
                className={cn(
                  "absolute top-full right-0 z-50 w-[min(52rem,calc(100vw-4rem))] origin-top rounded-2xl border border-ink-100 bg-white p-5 shadow-lift transition-all duration-200",
                  openMenu === ALL_MENU
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0",
                )}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/katalog/${cat.slug}`}
                        className="flex items-center gap-1.5 text-sm font-bold text-ink-900 transition-colors hover:text-brand-700"
                      >
                        {cat.icon && <span aria-hidden>{cat.icon}</span>}
                        {cat.name}
                      </Link>
                      {cat.children.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5">
                          {cat.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/katalog/${child.slug}`}
                                className="block rounded-lg px-2 py-1 -mx-2 text-[13px] text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </li>

            <li className="ml-auto shrink-0">
              <Link
                href="/promocii"
                className="flex items-center gap-1.5 whitespace-nowrap px-2.5 py-3 text-[13px] font-semibold text-amber-brand-600 transition-colors hover:text-amber-brand-700 xl:text-sm"
              >
                🔥 Промоции
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-cream transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-ink-100 px-4">
            <span className="font-display text-lg font-extrabold">Меню</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 hover:bg-ink-100"
              aria-label="Затвори менюто"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={submitSearch} className="relative border-b border-ink-100 p-4">
            <Search className="pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Търсене…"
              aria-label="Търсене в магазина"
              className="w-full rounded-full border border-ink-200 bg-white py-2.5 pr-4 pl-10 text-sm focus:border-brand-400 focus:outline-none"
            />
          </form>

          <nav className="flex-1 overflow-y-auto p-2" aria-label="Мобилни категории">
            {categories.map((cat) => (
              <MobileCategory key={cat.id} category={cat} />
            ))}
            <Link href="/promocii" className="block rounded-xl px-3 py-3 font-semibold text-amber-brand-600">
              🔥 Промоции
            </Link>
            <Link href="/dostavka" className="block rounded-xl px-3 py-3 text-ink-700">Доставка</Link>
            <Link href="/za-nas" className="block rounded-xl px-3 py-3 text-ink-700">За нас</Link>
            <Link href="/kontakti" className="block rounded-xl px-3 py-3 text-ink-700">Контакти</Link>
          </nav>

          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="flex items-center justify-center gap-2 border-t border-ink-100 bg-white p-4 font-semibold text-brand-700"
          >
            <Phone className="size-4" aria-hidden /> {SITE.phone}
          </a>
        </div>
      </div>
    </header>
  );
}

function MobileCategory({ category }: { category: NavCategory }) {
  const [open, setOpen] = useState(false);

  if (category.children.length === 0) {
    return (
      <Link href={`/katalog/${category.slug}`} className="block rounded-xl px-3 py-3 text-ink-800">
        {category.icon && <span className="mr-2" aria-hidden>{category.icon}</span>}
        {category.name}
      </Link>
    );
  }

  return (
    <div>
      <div className="flex items-center">
        <Link href={`/katalog/${category.slug}`} className="flex-1 rounded-xl px-3 py-3 text-ink-800">
          {category.icon && <span className="mr-2" aria-hidden>{category.icon}</span>}
          {category.name}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2.5 text-ink-500 hover:bg-ink-100"
          aria-label={open ? `Скрий подкатегориите на ${category.name}` : `Покажи подкатегориите на ${category.name}`}
          aria-expanded={open}
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="ml-4 border-l border-ink-200 pl-3">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/katalog/${child.slug}`}
                className="block rounded-lg px-3 py-2.5 text-sm text-ink-600"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
