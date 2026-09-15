import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyRow, PageHeader } from "@/components/admin/ui";
import { Pagination } from "@/components/shop/Pagination";
import { ORDER_STATUSES, statusMeta } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Поръчки" };

const PER_PAGE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);

  const where = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { number: { contains: query } },
            { customerName: { contains: query } },
            { phone: { contains: query } },
            { email: { contains: query } },
          ],
        }
      : {}),
  };

  const [orders, total, counts] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true, number: true, customerName: true, phone: true, city: true,
        total: true, status: true, createdAt: true, _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const countFor = (value: string) =>
    counts.find((c) => c.status === value)?._count.status ?? 0;

  return (
    <>
      <PageHeader title="Поръчки" description={`${total} поръчки`} />

      <Card className="mb-5 p-4">
        <form className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Номер, име, телефон или имейл…"
              aria-label="Търсене на поръчки"
              className="w-full rounded-full border border-ink-200 bg-cream py-2.5 pr-4 pl-10 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
          {status && <input type="hidden" name="status" value={status} />}
          <button type="submit" className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800">
            Търси
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/porachki"
            className={
              status === ""
                ? "rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white"
                : "rounded-full border border-ink-200 px-4 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50"
            }
          >
            Всички
          </Link>
          {ORDER_STATUSES.map((item) => (
            <Link
              key={item.value}
              href={`/admin/porachki?status=${item.value}`}
              className={
                status === item.value
                  ? "rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-ink-200 px-4 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50"
              }
            >
              {item.label} ({countFor(item.value)})
            </Link>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left">
            <thead className="border-b border-ink-100 bg-cream text-xs tracking-wide text-ink-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Номер</th>
                <th className="px-4 py-3 font-semibold">Клиент</th>
                <th className="px-4 py-3 font-semibold">Град</th>
                <th className="px-4 py-3 font-semibold">Артикули</th>
                <th className="px-4 py-3 font-semibold">Сума</th>
                <th className="px-4 py-3 font-semibold">Статус</th>
                <th className="px-4 py-3 font-semibold">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.length === 0 ? (
                <EmptyRow colSpan={7} text="Няма намерени поръчки." />
              ) : (
                orders.map((order) => {
                  const meta = statusMeta(order.status);
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-cream">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/porachki/${order.id}`}
                          className="text-sm font-bold text-ink-900 hover:text-brand-700"
                        >
                          {order.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block text-sm text-ink-800">{order.customerName}</span>
                        <span className="block text-xs text-ink-400">{order.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">{order.city}</td>
                      <td className="px-4 py-3 text-sm text-ink-600">{order._count.items}</td>
                      <td className="px-4 py-3 text-sm font-bold text-ink-900">
                        {formatPrice(order.total).eur}
                      </td>
                      <td className="px-4 py-3"><Badge className={meta.color}>{meta.label}</Badge></td>
                      <td className="px-4 py-3 text-xs text-ink-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PER_PAGE))}
        basePath="/admin/porachki"
        searchParams={params}
      />
    </>
  );
}
