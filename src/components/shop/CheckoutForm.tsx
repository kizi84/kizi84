"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { DELIVERY_METHODS, PAYMENT_METHODS, SHIPPING } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";

export function CheckoutForm() {
  const { lines, subtotal, clear, ready } = useCart();
  const router = useRouter();

  const [deliveryMethod, setDeliveryMethod] = useState<string>("speedy_office");
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const shipping = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    if (subtotal >= SHIPPING.countryFreeOver) return 0;
    const method = DELIVERY_METHODS.find((m) => m.value === deliveryMethod);
    return method?.rate ?? SHIPPING.officeRate;
  }, [deliveryMethod, subtotal]);

  const total = subtotal + shipping;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;

    const data = new FormData(e.currentTarget);
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.get("customerName"),
          email: data.get("email"),
          phone: data.get("phone"),
          city: data.get("city"),
          address: data.get("address"),
          postcode: data.get("postcode"),
          note: data.get("note"),
          deliveryMethod,
          paymentMethod,
          items: lines.map((l) => ({
            productId: l.productId,
            variant: l.variant,
            quantity: l.quantity,
          })),
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(payload.error ?? "Поръчката не можа да бъде приета. Опитайте отново.");
        setSubmitting(false);
        return;
      }

      clear();
      router.push(`/poruchka/${payload.number}`);
    } catch {
      setError("Няма връзка със сървъра. Проверете интернет връзката си.");
      setSubmitting(false);
    }
  }

  if (!ready) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-8 py-20 text-center">
        <p className="font-display text-lg font-bold text-ink-900">Количката е празна</p>
        <p className="mt-2 text-sm text-ink-500">Добавете продукти, преди да завършите поръчка.</p>
        <Link
          href="/katalog"
          className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Към каталога
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <fieldset className="rounded-2xl border border-ink-100 bg-white p-5 lg:p-6">
          <legend className="px-2 font-display text-lg font-bold text-ink-900">Данни за контакт</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="customerName" label="Име и фамилия *" required placeholder="Иван Петров" autoComplete="name" />
            <Field name="phone" label="Телефон *" required type="tel" placeholder="0888 123 456" autoComplete="tel" />
            <div className="sm:col-span-2">
              <Field name="email" label="Имейл *" required type="email" placeholder="ivan@example.com" autoComplete="email" />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-ink-100 bg-white p-5 lg:p-6">
          <legend className="px-2 font-display text-lg font-bold text-ink-900">Доставка</legend>

          <div className="space-y-2.5">
            {DELIVERY_METHODS.map((method) => (
              <label
                key={method.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                  deliveryMethod === method.value
                    ? "border-brand-500 bg-brand-50"
                    : "border-ink-200 hover:border-ink-300",
                )}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={method.value}
                  checked={deliveryMethod === method.value}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="size-4 text-brand-600 focus:ring-brand-400"
                />
                <span className="flex-1 text-sm font-medium text-ink-900">{method.label}</span>
                <span className="text-sm font-semibold text-ink-600">
                  {method.rate === 0
                    ? "Безплатно"
                    : subtotal >= SHIPPING.countryFreeOver
                      ? "Безплатно"
                      : formatPrice(method.rate).eur}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field name="city" label="Град / село *" required placeholder="Варна" autoComplete="address-level2" />
            <Field name="postcode" label="Пощенски код" placeholder="9000" autoComplete="postal-code" />
            <div className="sm:col-span-2">
              <Field
                name="address"
                label={deliveryMethod === "speedy_office" ? "Офис на Speedy *" : "Адрес за доставка *"}
                required
                placeholder={
                  deliveryMethod === "speedy_office"
                    ? "напр. Офис Варна Център"
                    : "ул. ..., бл., вх., ап."
                }
                autoComplete="street-address"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-ink-100 bg-white p-5 lg:p-6">
          <legend className="px-2 font-display text-lg font-bold text-ink-900">Плащане</legend>
          <div className="space-y-2.5">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                  paymentMethod === method.value
                    ? "border-brand-500 bg-brand-50"
                    : "border-ink-200 hover:border-ink-300",
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="size-4 text-brand-600 focus:ring-brand-400"
                />
                <span className="text-sm font-medium text-ink-900">{method.label}</span>
              </label>
            ))}
          </div>

          <div className="mt-5">
            <label htmlFor="note" className="block text-sm font-semibold text-ink-800">
              Бележка към поръчката
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="Допълнителна информация за куриера или екипа ни…"
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-cream px-4 py-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </div>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-44 lg:self-start">
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Вашата поръчка</h2>

          <ul className="mt-4 space-y-3 border-b border-ink-100 pb-4">
            {lines.map((line) => (
              <li key={`${line.productId}-${line.variant ?? ""}`} className="flex gap-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                  {line.image ? (
                    <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center" aria-hidden>🐾</span>
                  )}
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                    {line.quantity}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-xs font-medium text-ink-800">{line.name}</span>
                  {line.variant && <span className="block text-[11px] text-ink-400">{line.variant}</span>}
                </span>
                <span className="shrink-0 text-sm font-semibold text-ink-900">
                  {formatPrice(line.price * line.quantity).eur}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <dt>Продукти</dt>
              <dd>{formatPrice(subtotal).eur}</dd>
            </div>
            <div className="flex justify-between text-ink-600">
              <dt>Доставка</dt>
              <dd>{shipping === 0 ? <span className="font-semibold text-emerald-600">Безплатна</span> : formatPrice(shipping).eur}</dd>
            </div>
            <div className="flex items-end justify-between border-t border-ink-100 pt-3">
              <dt className="font-display font-bold text-ink-900">Общо</dt>
              <dd className="text-right">
                <span className="block font-display text-xl font-extrabold text-ink-900">
                  {formatPrice(total).eur}
                </span>
                <span className="block text-xs text-ink-400">{formatPrice(total).bgn}</span>
              </dd>
            </div>
          </dl>

          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Потвърди поръчката
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
            <ShieldCheck className="size-3.5" aria-hidden />
            Данните Ви се използват само за тази поръчка
          </p>
        </div>
      </aside>
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
      <label htmlFor={name} className="block text-sm font-semibold text-ink-800">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-1.5 w-full rounded-xl border border-ink-200 bg-cream px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
      />
    </div>
  );
}
