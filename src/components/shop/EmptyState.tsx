import Link from "next/link";
import { PackageSearch } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-8 py-20 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-ink-100 text-ink-400">
        <PackageSearch className="size-8" aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-lg font-bold text-ink-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-500">{description}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
