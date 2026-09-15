import Link from "next/link";
import {
  AlertTriangle, ArrowUpRight, Banknote, MessageSquareQuote, Package, ShoppingCart, TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { formatDate, formatPrice } from "@/lib/utils";
import { statusMeta } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    newOrders, totalOrders, monthRevenue, productCount,
    pendingReviews, lowStock, recentOrders, topProducts,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "new" } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: { not: "cancelled" } },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.review.count({ where: { status: "pending" } }),
    prisma.product.findMany({
      where: { isActive: true, trackStock: true, stock: { lte: 3 } },
      orderBy: { stock: "asc" },
      take: 6,
      select: { id: true, name: true, stock: true, slug: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true, number: true, customerName: true, total: true,
        status: true, createdAt: true, _count: { select: { items: true } },
      },
    }),
    prisma.product.findMany({
      where: { soldCount: { gt: 0 } },
      orderBy: { soldCount: "desc" },
      take: 5,
      select: { id: true, name: true, soldCount: true, price: true, slug: true },
    }),
  ]);

  const stats = [
    {
      label: "Нови поръчки",
      value: String(newOrders),
      hint: "чакат обработка",
      icon: ShoppingCart,
      href: "/admin/porachki?status=new",
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "Оборот този месец",
      value: formatPrice(monthRevenue._sum.total ?? 0).eur,
      hint: `${totalOrders} поръчки общо`,
      icon: Banknote,
      href: "/admin/porachki",
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Активни продукти",
      value: String(productCount),
      hint: "в каталога",
      icon: Package,
      href: "/admin/produkti",
      accent: "bg-violet-50 text-violet-600",
    },
    {
      label: "Отзиви за одобрение",
      value: String(pendingReviews),
      hint: "чакат преглед",
      icon: MessageSquareQuote,
      href: "/admin/otzivi",
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <>
      <PageHeader
        title="Табло"
        description="Бърз преглед на това, което се случва в магазина."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="card-hover h-full p-5">
              <div className="flex items-start justify-between">
                <span className={`grid size-11 place-items-center rounded-xl ${stat.accent}`}>
                  <stat.icon className="size-5" aria-hidden />
                </span>
                <ArrowUpRight className="size-4 text-ink-300" aria-hidden />
              </div>
              <p className="mt-4 font-display text-2xl font-extrabold text-ink-900">{stat.value}</p>
              <p className="text-sm font-medium text-ink-700">{stat.label}</p>
              <p className="text-xs text-ink-400">{stat.hint}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 p-5">
            <h2 className="font-display text-lg font-bold text-ink-900">Последни поръчки</h2>
            <Link href="/admin/porachki" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              Всички →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="p-10 text-center text-sm text-ink-400">Все още няма поръчки.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recentOrders.map((order) => {
                const meta = statusMeta(order.status);
                return (
                  <li key={order.id}>
                    <Link
                      href={`/admin/porachki/${order.id}`}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-cream"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink-900">{order.number}</p>
                        <p className="truncate text-xs text-ink-500">
                          {order.customerName} · {order._count.items} артикула
                        </p>
                      </div>
                      <Badge className={meta.color}>{meta.label}</Badge>
                      <div className="w-24 text-right">
                        <p className="text-sm font-bold text-ink-900">{formatPrice(order.total).eur}</p>
                        <p className="text-[11px] text-ink-400">{formatDate(order.createdAt)}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="border-b border-ink-100 p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                <AlertTriangle className="size-4.5 text-amber-brand-500" aria-hidden />
                Ниска наличност
              </h2>
            </div>
            {lowStock.length === 0 ? (
              <p className="p-8 text-center text-sm text-ink-400">Всички продукти са в наличност.</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {lowStock.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/admin/produkti/${product.id}`}
                      className="flex items-center gap-3 p-4 transition-colors hover:bg-cream"
                    >
                      <span className="line-clamp-2 flex-1 text-sm text-ink-700">{product.name}</span>
                      <Badge className={product.stock === 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}>
                        {product.stock} бр.
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="border-b border-ink-100 p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                <TrendingUp className="size-4.5 text-brand-600" aria-hidden />
                Най-продавани
              </h2>
            </div>
            {topProducts.length === 0 ? (
              <p className="p-8 text-center text-sm text-ink-400">Още няма продажби.</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {topProducts.map((product, index) => (
                  <li key={product.id}>
                    <Link
                      href={`/admin/produkti/${product.id}`}
                      className="flex items-center gap-3 p-4 transition-colors hover:bg-cream"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                        {index + 1}
                      </span>
                      <span className="line-clamp-2 flex-1 text-sm text-ink-700">{product.name}</span>
                      <span className="shrink-0 text-xs font-semibold text-ink-500">
                        {product.soldCount} бр.
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
