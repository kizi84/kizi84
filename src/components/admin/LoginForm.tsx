"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2, PawPrint } from "lucide-react";
import { FIELD_INPUT, FIELD_LABEL } from "@/lib/form-styles";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Входът не бе успешен");
        setLoading(false);
        return;
      }

      const from = params.get("from");
      router.push(from && from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Няма връзка със сървъра");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-600 text-white">
          <PawPrint className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900">
          Администрация
        </h1>
        <p className="mt-1 text-sm text-ink-500">Влезте, за да управлявате магазина</p>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <div>
          <label htmlFor="email" className={FIELD_LABEL}>Имейл</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            autoFocus
            className={FIELD_INPUT}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="password" className={FIELD_LABEL}>Парола</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={FIELD_INPUT}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Вход
        </button>
      </form>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full max-w-sm rounded-2xl" />}>
      <Form />
    </Suspense>
  );
}
