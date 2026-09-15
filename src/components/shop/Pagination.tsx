import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (pageCount <= 1) return null;

  function hrefFor(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page" || value === undefined) continue;
      params.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  // Window of pages around the current one, with first/last always reachable.
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const visible = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Страници">
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          className="grid size-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
          aria-label="Предишна страница"
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}

      {visible.map((p, index) => (
        <span key={p} className="flex items-center gap-1.5">
          {index > 0 && visible[index - 1] !== p - 1 && (
            <span className="px-1 text-ink-400" aria-hidden>…</span>
          )}
          <Link
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "grid size-10 place-items-center rounded-full text-sm font-semibold transition-colors",
              p === page
                ? "bg-brand-600 text-white"
                : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
            )}
          >
            {p}
          </Link>
        </span>
      ))}

      {page < pageCount && (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className="grid size-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
          aria-label="Следваща страница"
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
