"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="text-6xl" aria-hidden>🙀</span>
      <h1 className="mt-6 font-display text-2xl font-extrabold text-ink-900">
        Нещо се обърка
      </h1>
      <p className="mt-3 max-w-md text-ink-600">
        Възникна неочаквана грешка. Опитайте отново — ако проблемът продължи, свържете се с нас.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700"
      >
        <RefreshCw className="size-4" aria-hidden />
        Опитай отново
      </button>
    </div>
  );
}
