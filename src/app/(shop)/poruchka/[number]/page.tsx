import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DELIVERY_METHODS, PAYMENT_METHODS, SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Поръчката е приета",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;

  const order = await prisma.order.findUnique({
    where: { number },
    include: { items: true },
  });

  if (!order) notFound();

  const delivery = DELIVERY_METHODS.find((m) => m.value === order.deliveryMethod);
  const payment = PAYMENT_METHODS.find((m) => m.value === order.paymentMethod);

  return (
    <div className="container-page py-12 lg:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <CheckCircle2 className="size-11" aria-hidden />
          </span>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">
            Благодарим за поръчката!
          </h1>
          <p className="mt-3 text-ink-600">
            Поръчка <strong className="text-ink-900">№ {order.number}</strong> е приета успешно.
            Ще Ви се обадим за потвърждение на <strong className="text-ink-900">{order.phone}</strong>.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
            <Package className="size-5 text-brand-600" aria-hidden />
            Детайли по поръчката
          </h2>

          <ul className="mt-5 space-y-3 border-b border-ink-100 pb-5">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                  {item.image ? (
                    <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center" aria-hidden>🐾</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink-900">{item.name}</span>
                  <span className="block text-xs text-ink-500">
                    {item.variant ? `${item.variant} · ` : ""}{item.quantity} × {formatPrice(item.price).eur}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-ink-900">
                  {formatPrice(item.price * item.quantity).eur}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 text-sm">
            <Row label="Продукти" value={formatPrice(order.subtotal).eur} />
            <Row
              label="Доставка"
              value={order.shipping === 0 ? "Безплатна" : formatPrice(order.shipping).eur}
            />
            <div className="flex items-end justify-between border-t border-ink-100 pt-3">
              <dt className="font-display font-bold text-ink-900">Общо за плащане</dt>
              <dd className="text-right">
                <span className="block font-display text-xl font-extrabold text-ink-900">
                  {formatPrice(order.total).eur}
                </span>
                <span className="block text-xs text-ink-400">{formatPrice(order.total).bgn}</span>
              </dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-4 border-t border-ink-100 pt-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Доставка до</p>
              <p className="mt-1 text-ink-800">{order.customerName}</p>
              <p className="text-ink-600">{order.city}{order.postcode ? `, ${order.postcode}` : ""}</p>
              <p className="text-ink-600">{order.address}</p>
              <p className="mt-1 text-ink-500">{delivery?.label}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Плащане</p>
              <p className="mt-1 text-ink-800">{payment?.label}</p>
              <p className="mt-3 text-xs font-semibold tracking-wide text-ink-400 uppercase">Имейл</p>
              <p className="mt-1 text-ink-800">{order.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/katalog"
            className="rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Продължи пазаруването
          </Link>
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-7 py-3.5 font-semibold text-ink-800 transition-colors hover:bg-ink-50"
          >
            <Phone className="size-4" aria-hidden />
            Имам въпрос
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          Запазете номера на поръчката — ще Ви е нужен при въпроси към нашия екип.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-600">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
