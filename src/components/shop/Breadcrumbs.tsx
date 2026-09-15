import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/lib/constants";

export type Crumb = { href: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ href: "/", label: "Начало" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `${SITE.url}${crumb.href}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Навигация" className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        {all.map((crumb, index) => {
          const isLast = index === all.length - 1;
          return (
            <span key={crumb.href} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="size-3 text-ink-300" aria-hidden />}
              {isLast ? (
                <span className="font-medium text-ink-700">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-brand-700">{crumb.label}</Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
