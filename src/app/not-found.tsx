import Link from "next/link";
import { Home, Search } from "lucide-react";

export const metadata = {
  title: "Страницата не е намерена",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <html lang="bg">
      <body className="bg-cream">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <span className="text-7xl" aria-hidden>🐕</span>
          <p className="mt-6 font-display text-6xl font-extrabold text-brand-600">404</p>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-ink-900">
            Тази страница я няма
          </h1>
          <p className="mt-3 max-w-md text-ink-600">
            Възможно е продуктът да е премахнат или адресът да е сгрешен.
            Пробвайте от началната страница или потърсете в каталога.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <Home className="size-4" aria-hidden />
              Начална страница
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-7 py-3.5 font-semibold text-ink-800 transition-colors hover:bg-ink-50"
            >
              <Search className="size-4" aria-hidden />
              Разгледай каталога
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
