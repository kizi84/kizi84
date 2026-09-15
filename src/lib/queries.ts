import { prisma } from "@/lib/prisma";
import type { NavCategory } from "@/components/shop/Header";

/** Top-level categories plus their children, for the header navigation. */
export async function getNavCategories(): Promise<NavCategory[]> {
  const categories = await prisma.category.findMany({
    where: { parentId: null, isActive: true, showInMenu: true },
    orderBy: { position: "asc" },
    select: {
      id: true, slug: true, name: true, icon: true,
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        select: { id: true, slug: true, name: true },
      },
    },
  });
  return categories;
}

export const PRODUCT_CARD_SELECT = {
  id: true, slug: true, name: true, price: true, oldPrice: true,
  images: true, variants: true, stock: true, trackStock: true, isNew: true,
  ratingAvg: true, ratingCount: true, unit: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
} as const;

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { updatedAt: "desc" },
    take,
    select: PRODUCT_CARD_SELECT,
  });
}

export async function getNewProducts(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take,
    select: PRODUCT_CARD_SELECT,
  });
}

export async function getSaleProducts(take = 8) {
  const products = await prisma.product.findMany({
    where: { isActive: true, oldPrice: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: take * 2,
    select: PRODUCT_CARD_SELECT,
  });
  // Prisma/SQLite can't compare two columns in a filter, so drop
  // non-discounts (oldPrice <= price) here.
  return products.filter((p) => p.oldPrice !== null && p.oldPrice > p.price).slice(0, take);
}

/** A category plus every descendant id — lets a parent page list its children's products. */
export async function getCategoryWithDescendantIds(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        select: { id: true, slug: true, name: true, image: true, icon: true },
      },
      parent: { select: { slug: true, name: true } },
    },
  });
  if (!category) return null;

  const ids = [category.id, ...category.children.map((c) => c.id)];

  // Categories are at most three levels deep; one extra lookup covers grandchildren.
  const grandchildren = await prisma.category.findMany({
    where: { parentId: { in: category.children.map((c) => c.id) } },
    select: { id: true },
  });

  return { category, categoryIds: [...ids, ...grandchildren.map((g) => g.id)] };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: { include: { parent: { select: { slug: true, name: true } } } },
      reviews: {
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string | null, take = 4) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { soldCount: "desc" },
    take,
    select: PRODUCT_CARD_SELECT,
  });
}

/** Recomputes a product's cached rating after a review is approved or removed. */
export async function refreshProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, status: "approved" },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      ratingCount: agg._count.rating,
    },
  });
}

export type ProductCardData = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

/**
 * Top-level categories with a product count that includes every descendant —
 * products live on leaf categories, so a direct count would read zero.
 */
export async function getTopCategoriesWithCounts(take = 6) {
  const [categories, grouped] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { position: "asc" },
      take,
      select: {
        id: true, slug: true, name: true, icon: true, image: true,
        children: { select: { id: true, children: { select: { id: true } } } },
      },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { isActive: true, categoryId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const countByCategory = new Map(
    grouped.map((row) => [row.categoryId as string, row._count._all]),
  );

  return categories.map((category) => {
    const ids = [
      category.id,
      ...category.children.map((child) => child.id),
      ...category.children.flatMap((child) => child.children.map((g) => g.id)),
    ];

    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      icon: category.icon,
      image: category.image,
      _count: {
        products: ids.reduce((sum, id) => sum + (countByCategory.get(id) ?? 0), 0),
      },
    };
  });
}
