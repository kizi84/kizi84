import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { deleteOrder, saveOrderNote, updateOrderStatus } from "@/app/admin/actions";
import { DELIVERY_METHODS, ORDER_STATUSES, PAYMENT_METHODS, statusMeta } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { number: true } });
  return { title: order ? `Поръчка ${order.number}` : "Поръчката не е намерена" };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });

  if (!order) notFound();

  const meta = statusMeta(order.status);
  const delivery = DELIVERY_METHODS.find((m) => m.value === order.deliveryMethod);
  const payment = PAYMENT_METHODS.find((m) => m.value === order.paymentMethod);

  return (
    <>
      <Link
        href="/admin/porachki"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Обратно към поръчките
      </Link>

      <PageHeader
        title={`Поръчка ${order.number}`}
        description={formatDate(order.createdAt)}
        action={
          <form action={deleteOrder}>
            <input type="hidden" name="id" value={order.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="size-4" aria-hidden />
              Изтрий
            </button>
          </form>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          <Card>
            <div className="border-b border-ink-100 p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">
                Артикули ({order.items.length})
              </h2>
            </div>

            <ul className="divide-y divide-ink-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-4">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <span className="grid h-full place-items-center opacity-40" aria-hidden>🐾</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    {item.product ? (
                      <Link
                        href={`/produkt/${item.product.slug}`}
                        target="_blank"
                        className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-700"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className="line-clamp-2 text-sm font-semibold text-ink-900">{item.name}</span>
                    )}
                    <span className="block text-xs text-ink-500">
                      {item.variant ? `${item.variant} · ` : ""}
                      {item.quantity} × {formatPrice(item.price).eur}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-ink-900">
                    {formatPrice(item.price * item.quantity).eur}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 border-t border-ink-100 p-5 text-sm">
              <div className="flex justify-between text-ink-600">
                <dt>Продукти</dt>
                <dd>{formatPrice(order.subtotal).eur}</dd>
              </div>
              <div className="flex justify-between text-ink-600">
                <dt>Доставка</dt>
                <dd>{order.shipping === 0 ? "Безплатна" : formatPrice(order.shipping).eur}</dd>
              </div>
              <div className="flex items-end justify-between border-t border-ink-100 pt-3">
                <dt className="font-display font-bold text-ink-900">Общо</dt>
                <dd className="text-right">
                  <span className="block font-display text-xl font-extrabold text-ink-900">
                    {formatPrice(order.total).eur}
                  </span>
                  <span className="block text-xs text-ink-400">{formatPrice(order.total).bgn}</span>
                </dd>
              </div>
            </dl>
          </Card>

          {order.note && (
            <Card className="p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">Бележка от клиента</h2>
              <p className="mt-2 text-sm whitespace-pre-line text-ink-700">{order.note}</p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="font-display text-lg font-bold text-ink-900">Вътрешна бележка</h2>
            <form action={saveOrderNote} className="mt-3">
              <input type="hidden" name="id" value={order.id} />
              <textarea
                name="adminNote"
                rows={3}
                defaultValue={order.adminNote ?? ""}
                placeholder="Видимо само за екипа — напр. номер на товарителница."
                className="w-full rounded-xl border border-ink-200 bg-cream px-4 py-3 text-sm focus:border-brand-400 focus:outline-none"
              />
              <button
                type="submit"
                className="mt-3 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
              >
                Запази бележката
              </button>
            </form>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold text-ink-900">Статус</h2>
            <div className="mt-3">
              <Badge className={meta.color}>{meta.label}</Badge>
            </div>

            <form action={updateOrderStatus} className="mt-4">
              <input type="hidden" name="id" value={order.id} />
              <label htmlFor="status" className="sr-only">Нов статус</label>
              <select
                id="status"
                name="status"
                defaultValue={order.status}
                className="w-full rounded-xl border border-ink-200 bg-cream px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              >
                {ORDER_STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="mt-3 w-full rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Обнови статуса
              </button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-lg font-bold text-ink-900">Клиент</h2>
            <p className="mt-3 text-sm font-semibold text-ink-900">{order.customerName}</p>

            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <a href={`tel:${order.phone}`} className="flex items-center gap-2.5 text-ink-700 hover:text-brand-700">
                  <Phone className="size-4 shrink-0 text-brand-600" aria-hidden />
                  {order.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${order.email}`} className="flex items-center gap-2.5 break-all text-ink-700 hover:text-brand-700">
                  <Mail className="size-4 shrink-0 text-brand-600" aria-hidden />
                  {order.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-ink-700">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                <span>
                  {order.city}{order.postcode ? `, ${order.postcode}` : ""}
                  <br />
                  {order.address}
                </span>
              </li>
            </ul>

            <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-sm">
              <div>
                <dt className="text-xs tracking-wide text-ink-400 uppercase">Доставка</dt>
                <dd className="text-ink-800">{delivery?.label}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-ink-400 uppercase">Плащане</dt>
                <dd className="text-ink-800">{payment?.label}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
