import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Pencil, Plus, Search, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyRow, PageHeader, PrimaryLink } from "@/components/admin/ui";
import { Pagination } from "@/components/shop/Pagination";
import { toggleProductFlag } from "@/app/admin/actions";
import { formatPrice, parseImages } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const filter = typeof params.filter === "string" ? params.filter : "";
  const page = Math.max(1, Number(params.page) || 1);

  const where = {
    ...(query
      ? { OR: [{ name: { contains: query } }, { sku: { contains: query } }] }
      : {}),
    ...(filter === "inactive" ? { isActive: false } : {}),
    ...(filter === "featured" ? { isFeatured: true } : {}),
    ...(filter === "lowstock" ? { trackStock: true, stock: { lte: 3 } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true, name: true, slug: true, sku: true, price: true, oldPrice: true,
        stock: true, trackStock: true, images: true, isActive: true, isFeatured: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const filters = [
    { value: "", label: "Всички" },
    { value: "featured", label: "Избрани" },
    { value: "lowstock", label: "Ниска наличност" },
    { value: "inactive", label: "Скрити" },
  ];

  return (
    <>
      <PageHeader
        title="Продукти"
        description={`${total} продукта в каталога`}
        action={
          <PrimaryLink href="/admin/produkti/nov">
            <Plus className="size-4" aria-hidden />
            Нов продукт
          </PrimaryLink>
        }
      />

      <Card className="mb-5 p-4">
        <form className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Търсене по име или SKU…"
              aria-label="Търсене на продукти"
              className="w-full rounded-full border border-ink-200 bg-cream py-2.5 pr-4 pl-10 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
          {filter && <input type="hidden" name="filter" value={filter} />}
          <button
            type="submit"
            className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
          >
            Търси
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((item) => {
            const active = filter === item.value;
            const href = item.value
              ? `/admin/produkti?filter=${item.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`
              : `/admin/produkti${query ? `?q=${encodeURIComponent(query)}` : ""}`;
            return (
              <Link
                key={item.label}
                href={href}
                className={
                  active
                    ? "rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white"
                    : "rounded-full border border-ink-200 px-4 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left">
            <thead className="border-b border-ink-100 bg-cream text-xs tracking-wide text-ink-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Продукт</th>
                <th className="px-4 py-3 font-semibold">Категория</th>
                <th className="px-4 py-3 font-semibold">Цена</th>
                <th className="px-4 py-3 font-semibold">Наличност</th>
                <th className="px-4 py-3 font-semibold">Статус</th>
                <th className="px-4 py-3 text-right font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products.length === 0 ? (
                <EmptyRow colSpan={6} text="Няма намерени продукти." />
              ) : (
                products.map((product) => {
                  const image = parseImages(product.images)[0];
                  const outOfStock = product.trackStock && product.stock <= 0;

                  return (
                    <tr key={product.id} className="transition-colors hover:bg-cream">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                            {image ? (
                              <Image src={image} alt="" fill sizes="48px" className="object-cover" />
                            ) : (
                              <span className="grid h-full place-items-center text-lg opacity-40" aria-hidden>🐾</span>
                            )}
                          </span>
                          <span className="min-w-0">
                            <Link
                              href={`/admin/produkti/${product.id}`}
                              className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-700"
                            >
                              {product.name}
                            </Link>
                            <span className="block text-xs text-ink-400">
                              {product.brand?.name ?? "—"}{product.sku ? ` · ${product.sku}` : ""}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">{product.category?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-ink-900">{formatPrice(product.price).eur}</span>
                        {product.oldPrice !== null && product.oldPrice > product.price && (
                          <span className="block text-xs text-ink-400 line-through">
                            {formatPrice(product.oldPrice).eur}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!product.trackStock ? (
                          <Badge className="bg-ink-100 text-ink-600">не се следи</Badge>
                        ) : (
                          <Badge
                            className={
                              outOfStock
                                ? "bg-rose-100 text-rose-700"
                                : product.stock <= 3
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }
                          >
                            {product.stock} бр.
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge className={product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-ink-200 text-ink-600"}>
                            {product.isActive ? "Активен" : "Скрит"}
                          </Badge>
                          {product.isFeatured && (
                            <Badge className="bg-amber-100 text-amber-700">Избран</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <form action={toggleProductFlag}>
                            <input type="hidden" name="id" value={product.id} />
                            <input type="hidden" name="field" value="isFeatured" />
                            <button
                              type="submit"
                              className="grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-amber-50 hover:text-amber-600"
                              title={product.isFeatured ? "Премахни от избрани" : "Направи избран"}
                              aria-label={product.isFeatured ? "Премахни от избрани" : "Направи избран"}
                            >
                              <Star className={product.isFeatured ? "size-4 fill-amber-brand-400 text-amber-brand-500" : "size-4"} />
                            </button>
                          </form>

                          <form action={toggleProductFlag}>
                            <input type="hidden" name="id" value={product.id} />
                            <input type="hidden" name="field" value="isActive" />
                            <button
                              type="submit"
                              className="grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                              title={product.isActive ? "Скрий от сайта" : "Покажи в сайта"}
                              aria-label={product.isActive ? "Скрий от сайта" : "Покажи в сайта"}
                            >
                              {product.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                            </button>
                          </form>

                          <Link
                            href={`/admin/produkti/${product.id}`}
                            className="grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-brand-50 hover:text-brand-700"
                            title="Редактирай"
                            aria-label={`Редактирай ${product.name}`}
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </div>
                      </td>
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
        basePath="/admin/produkti"
        searchParams={params}
      />
    </>
  );
}
