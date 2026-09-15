"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ExternalLink, FolderTree, LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote,
  Package, PawPrint, ShoppingCart, Tags, Upload, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Badges = { orders: number; reviews: number; messages: number };

const navItems = [
  { href: "/admin", label: "Табло", icon: LayoutDashboard, exact: true },
  { href: "/admin/porachki", label: "Поръчки", icon: ShoppingCart, badge: "orders" as const },
  { href: "/admin/produkti", label: "Продукти", icon: Package },
  { href: "/admin/kategorii", label: "Категории", icon: FolderTree },
  { href: "/admin/marki", label: "Марки", icon: Tags },
  { href: "/admin/otzivi", label: "Отзиви", icon: MessageSquareQuote, badge: "reviews" as const },
  { href: "/admin/sabshteniya", label: "Съобщения", icon: Mail, badge: "messages" as const },
  { href: "/admin/import", label: "Импорт на продукти", icon: Upload },
];

export function AdminShell({
  user,
  badges,
  children,
}: {
  user: { name: string; email: string };
  badges: Badges;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex h-16 shrink-0 items-center gap-2.5 border-b border-ink-800 px-5">
        <span className="grid size-9 place-items-center rounded-lg bg-brand-500 text-white">
          <PawPrint className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block font-display leading-none font-extrabold text-white">Uzunov 90</span>
          <span className="block text-[10px] text-ink-400">администрация</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Админ навигация">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const count = item.badge ? badges[item.badge] : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand-600 text-white" : "text-ink-300 hover:bg-ink-800 hover:text-white",
              )}
            >
              <item.icon className="size-4.5 shrink-0" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold",
                    active ? "bg-white text-brand-700" : "bg-amber-brand-400 text-ink-900",
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-ink-800 p-3">
        <Link
          href="/"
          target="_blank"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:bg-ink-800 hover:text-white"
        >
          <ExternalLink className="size-4.5" aria-hidden />
          Виж сайта
        </Link>

        <div className="rounded-xl bg-ink-800 p-3">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-ink-400">{user.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-ink-700 py-2 text-xs font-semibold text-ink-200 hover:bg-rose-600 hover:text-white"
          >
            <LogOut className="size-3.5" aria-hidden />
            Изход
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-ink-900 lg:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink-900/50 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-64 bg-ink-900 transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {sidebar}
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-ink-100 bg-cream/90 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 hover:bg-ink-100"
            aria-label="Отвори менюто"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display font-extrabold">Администрация</span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
