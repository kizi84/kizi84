import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/constants";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.brand.findMany({ select: { slug: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/katalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/promocii`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/marki`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE.url}/dostavka`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/za-nas`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/kontakti`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/obshti-usloviya`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/poveritelnost`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...categories.map((category) => ({
      url: `${SITE.url}/katalog/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE.url}/produkt/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...brands.map((brand) => ({
      url: `${SITE.url}/marki/${brand.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
