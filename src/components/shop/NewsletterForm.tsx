"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-brand-600/20 px-4 py-3 text-sm text-brand-200">
        <Check className="size-4 shrink-0" aria-hidden />
        Благодарим! Ще Ви пишем при нови промоции.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="newsletter-email" className="block text-xs text-ink-400">
        Промоции и новини — без спам.
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="вашият@имейл.bg"
          className="min-w-0 flex-1 rounded-xl border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-sm text-white placeholder:text-ink-500 focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-400 disabled:opacity-60"
          aria-label="Абонирай се"
        >
          {state === "loading"
            ? <Loader2 className="size-4 animate-spin" aria-hidden />
            : <Send className="size-4" aria-hidden />}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-xs text-rose-400">Нещо се обърка. Опитайте отново.</p>
      )}
    </form>
  );
}
