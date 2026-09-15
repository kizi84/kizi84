import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CARD_SELECT } from "@/lib/queries";

export const PAGE_SIZE = 12;

export type CatalogSearchParams = {
  q?: string;
  brand?: string | string[];
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
  stock?: string;
};

export const SORT_OPTIONS = [
  { value: "popular", label: "Най-популярни" },
  { value: "new", label: "Най-нови" },
  { value: "price-asc", label: "Цена: ниска → висока" },
  { value: "price-desc", label: "Цена: висока → ниска" },
  { value: "rating", label: "Най-високо оценени" },
  { value: "name", label: "Име (А–Я)" },
] as const;

function orderBy(sort: string | undefined): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "new": return [{ createdAt: "desc" }];
    case "price-asc": return [{ price: "asc" }];
    case "price-desc": return [{ price: "desc" }];
    case "rating": return [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
    case "name": return [{ name: "asc" }];
    default: return [{ soldCount: "desc" }, { viewCount: "desc" }, { createdAt: "desc" }];
  }
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}

export function buildWhere(
  params: CatalogSearchParams,
  extra: Prisma.ProductWhereInput = {},
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true, ...extra };
  const and: Prisma.ProductWhereInput[] = [];

  const q = params.q?.trim();
  if (q) {
    // SQLite's LIKE is case-insensitive for ASCII only, so Cyrillic terms are
    // matched as typed — good enough for a shop-scale catalog.
    and.push({
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { shortDescription: { contains: q } },
        { sku: { contains: q } },
        { brand: { name: { contains: q } } },
      ],
    });
  }

  const brands = toArray(params.brand);
  if (brands.length > 0) and.push({ brand: { slug: { in: brands } } });

  const min = Number(params.min);
  const max = Number(params.max);
  if (Number.isFinite(min) && params.min) and.push({ price: { gte: min } });
  if (Number.isFinite(max) && params.max) and.push({ price: { lte: max } });

  if (params.stock === "1") and.push({ OR: [{ trackStock: false }, { stock: { gt: 0 } }] });

  if (and.length > 0) where.AND = and;
  return where;
}

export async function queryCatalog(
  params: CatalogSearchParams,
  extra: Prisma.ProductWhereInput = {},
) {
  const where = buildWhere(params, extra);
  const page = Math.max(1, Number(params.page) || 1);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: orderBy(params.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: PRODUCT_CARD_SELECT,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Brands present in the current result set, so filters never offer a dead end. */
export async function getFilterBrands(extra: Prisma.ProductWhereInput = {}) {
  const rows = await prisma.product.findMany({
    where: { isActive: true, brandId: { not: null }, ...extra },
    select: { brand: { select: { id: true, slug: true, name: true } } },
    distinct: ["brandId"],
  });

  return rows
    .map((r) => r.brand)
    .filter((b): b is { id: string; slug: string; name: string } => b !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "bg"));
}

export async function getPriceBounds(extra: Prisma.ProductWhereInput = {}) {
  const agg = await prisma.product.aggregate({
    where: { isActive: true, ...extra },
    _min: { price: true },
    _max: { price: true },
  });
  return {
    min: Math.floor(agg._min.price ?? 0),
    max: Math.ceil(agg._max.price ?? 100),
  };
}
