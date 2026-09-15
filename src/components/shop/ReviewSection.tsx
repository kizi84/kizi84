"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { FIELD_INPUT, FIELD_LABEL } from "@/lib/form-styles";
import { cn, formatDate } from "@/lib/utils";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: Date | string;
};

export function ReviewSection({
  productId,
  reviews,
  ratingAvg,
  ratingCount,
}: {
  productId: string;
  reviews: Review[];
  ratingAvg: number;
  ratingCount: number;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section id="otzivi" className="scroll-mt-44">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-extrabold text-ink-900">
          Отзиви {ratingCount > 0 && <span className="text-ink-400">({ratingCount})</span>}
        </h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
        >
          {showForm ? "Откажи" : "Напиши отзив"}
        </button>
      </div>

      {ratingCount > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <Stars value={Math.round(ratingAvg)} />
          <span className="text-sm text-ink-600">
            <strong className="text-ink-900">{ratingAvg.toFixed(1)}</strong> от 5
          </span>
        </div>
      )}

      {showForm && <ReviewForm productId={productId} onDone={() => setShowForm(false)} />}

      {reviews.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center text-sm text-ink-500">
          Все още няма отзиви за този продукт. Бъдете първи!
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-brand-50 font-display font-bold text-brand-700">
                    {review.authorName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-900">{review.authorName}</p>
                    <p className="text-xs text-ink-400">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <Stars value={review.rating} />
              </div>

              {review.title && (
                <p className="mt-3 font-display font-bold text-ink-900">{review.title}</p>
              )}
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-700">{review.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex" aria-label={`Оценка ${value} от 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cn("size-4", n <= value ? "fill-amber-brand-400 text-amber-brand-400" : "text-ink-200")}
        />
      ))}
    </div>
  );
}

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          authorName: data.get("authorName"),
          email: data.get("email"),
          title: data.get("title"),
          body: data.get("body"),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Възникна грешка. Опитайте отново.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Няма връзка със сървъра.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-display font-bold text-emerald-800">Благодарим за отзива!</p>
        <p className="mt-1 text-sm text-emerald-700">
          Ще го публикуваме веднага след като екипът ни го прегледа.
        </p>
        <button type="button" onClick={onDone} className="mt-4 text-sm font-semibold text-emerald-800 underline">
          Затвори
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-ink-100 bg-white p-5 lg:p-6">
      <fieldset>
        <legend className="text-sm font-bold text-ink-900">Вашата оценка</legend>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} от 5 звезди`}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  n <= (hover || rating) ? "fill-amber-brand-400 text-amber-brand-400" : "text-ink-200",
                )}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Вашето име *" name="authorName" required placeholder="Иван Петров" />
        <Field label="Имейл (не се публикува)" name="email" type="email" placeholder="ivan@example.com" />
      </div>

      <div className="mt-4">
        <Field label="Заглавие" name="title" placeholder="Кратко обобщение" />
      </div>

      <div className="mt-4">
        <label htmlFor="review-body" className={FIELD_LABEL}>
          Вашият отзив *
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          rows={4}
          minLength={10}
          placeholder="Споделете опита си с този продукт…"
          className={FIELD_INPUT}
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "loading" && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Изпрати отзив
      </button>
    </form>
  );
}

function Field({
  label, name, type = "text", required = false, placeholder,
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={`review-${name}`} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={`review-${name}`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={FIELD_INPUT}
      />
    </div>
  );
}
