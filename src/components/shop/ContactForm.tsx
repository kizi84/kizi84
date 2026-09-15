"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FIELD_INPUT, FIELD_LABEL } from "@/lib/form-styles";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          subject: data.get("subject"),
          body: data.get("body"),
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="size-14 text-emerald-600" aria-hidden />
        <h2 className="mt-4 font-display text-xl font-bold text-emerald-900">Съобщението е изпратено</h2>
        <p className="mt-2 text-sm text-emerald-700">
          Ще Ви отговорим в рамките на един работен ден.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-ink-100 bg-white p-6 lg:p-8">
      <h2 className="font-display text-lg font-bold text-ink-900">Изпратете запитване</h2>
      <p className="mt-1 text-sm text-ink-500">Отговаряме в рамките на един работен ден.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Име *" required placeholder="Иван Петров" autoComplete="name" />
        <Field name="phone" label="Телефон" type="tel" placeholder="0888 123 456" autoComplete="tel" />
        <div className="sm:col-span-2">
          <Field name="email" label="Имейл *" type="email" required placeholder="ivan@example.com" autoComplete="email" />
        </div>
        <div className="sm:col-span-2">
          <Field name="subject" label="Тема" placeholder="Въпрос относно поръчка" />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-body" className={FIELD_LABEL}>
          Съобщение *
        </label>
        <textarea
          id="contact-body"
          name="body"
          required
          rows={5}
          minLength={10}
          placeholder="Опишете въпроса си…"
          className={FIELD_INPUT}
        />
      </div>

      {state === "error" && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Съобщението не беше изпратено. Опитайте отново или ни се обадете.
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "loading" && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Изпрати съобщение
      </button>
    </form>
  );
}

function Field({
  name, label, type = "text", required = false, placeholder, autoComplete,
}: {
  name: string; label: string; type?: string; required?: boolean;
  placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={`contact-${name}`} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={`contact-${name}`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={FIELD_INPUT}
      />
    </div>
  );
}
