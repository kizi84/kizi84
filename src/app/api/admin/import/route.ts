import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify, BGN_PER_EUR } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Bulk product import.
 *
 * Accepts the rows produced by `scripts/import-legacy.ts` (the scraper for the
 * old uzunov90.com site) as well as a plain CSV export, so the whole existing
 * catalogue can be brought over in one call and re-run safely afterwards —
 * `legacyId` (or the slug) keys the upsert.
 */
const rowSchema = z.object({
  legacyId: z.string().trim().max(60).optional().nullable(),
  name: z.string().trim().min(1).max(220),
  slug: z.string().trim().max(120).optional().nullable(),
  sku: z.string().trim().max(80).optional().nullable(),
  price: z.number().min(0),
  oldPrice: z.number().min(0).optional().nullable(),
  /** When "BGN", prices are converted to EUR at the fixed changeover rate. */
  currency: z.enum(["EUR", "BGN"]).optional(),
  stock: z.number().int().min(0).optional(),
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  images: z.array(z.string()).optional(),
  category: z.string().trim().max(160).optional().nullable(),
  parentCategory: z.string().trim().max(160).optional().nullable(),
  brand: z.string().trim().max(120).optional().nullable(),
  isActive: z.boolean().optional(),
});

const payloadSchema = z.object({
  products: z.array(rowSchema).min(1).max(5000),
  /** Deactivate products that were not part of this import. */
  deactivateMissing: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Няма достъп" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Невалиден JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: `Ред ${issue?.path?.[1] ?? "?"}: ${issue?.message ?? "невалидни данни"}` },
      { status: 400 },
    );
  }

  const { products: rows, deactivateMissing } = parsed.data;

  const categoryCache = new Map<string, string>();
  const brandCache = new Map<string, string>();
  const touched: string[] = [];

  let created = 0;
  let updated = 0;
  const failures: string[] = [];

  async function ensureCategory(name: string, parentName?: string | null): Promise<string> {
    const key = `${parentName ?? ""}>${name}`;
    const cached = categoryCache.get(key);
    if (cached) return cached;

    const parentId = parentName ? await ensureCategory(parentName) : null;
    const slug = slugify(parentName ? `${parentName}-${name}` : name);

    const existing = await prisma.category.findFirst({
      where: { name, parentId },
      select: { id: true },
    });

    const id = existing
      ? existing.id
      : (
          await prisma.category.create({
            data: { name, slug, parentId, position: categoryCache.size },
            select: { id: true },
          })
        ).id;

    categoryCache.set(key, id);
    return id;
  }

  async function ensureBrand(name: string): Promise<string> {
    const cached = brandCache.get(name);
    if (cached) return cached;

    const existing = await prisma.brand.findFirst({ where: { name }, select: { id: true } });
    const id = existing
      ? existing.id
      : (await prisma.brand.create({ data: { name, slug: slugify(name) }, select: { id: true } })).id;

    brandCache.set(name, id);
    return id;
  }

  for (const row of rows) {
    try {
      const rate = row.currency === "BGN" ? BGN_PER_EUR : 1;
      const price = Math.round((row.price / rate) * 100) / 100;
      const oldPrice =
        row.oldPrice != null ? Math.round((row.oldPrice / rate) * 100) / 100 : null;

      const categoryId = row.category ? await ensureCategory(row.category, row.parentCategory) : null;
      const brandId = row.brand ? await ensureBrand(row.brand) : null;

      // Match on legacyId first, then slug — so a re-run updates rather than duplicates.
      const existing = row.legacyId
        ? await prisma.product.findUnique({ where: { legacyId: row.legacyId }, select: { id: true, slug: true } })
        : row.slug
          ? await prisma.product.findUnique({ where: { slug: row.slug }, select: { id: true, slug: true } })
          : null;

      const data = {
        name: row.name,
        sku: row.sku || null,
        price,
        oldPrice,
        stock: row.stock ?? 0,
        shortDescription: row.shortDescription || null,
        description: row.description || null,
        images: JSON.stringify(row.images ?? []),
        categoryId,
        brandId,
        isActive: row.isActive ?? true,
        legacyId: row.legacyId || null,
      };

      if (existing) {
        await prisma.product.update({ where: { id: existing.id }, data });
        touched.push(existing.id);
        updated += 1;
      } else {
        // Build a slug that is free at insert time.
        let slug = slugify(row.slug || row.name);
        let suffix = 1;
        while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
          suffix += 1;
          slug = `${slugify(row.slug || row.name)}-${suffix}`;
        }

        const product = await prisma.product.create({
          data: { ...data, slug },
          select: { id: true },
        });
        touched.push(product.id);
        created += 1;
      }
    } catch (error) {
      failures.push(`${row.name}: ${error instanceof Error ? error.message : "неуспешен запис"}`);
    }
  }

  let deactivated = 0;
  if (deactivateMissing && touched.length > 0) {
    const result = await prisma.product.updateMany({
      where: { id: { notIn: touched }, isActive: true },
      data: { isActive: false },
    });
    deactivated = result.count;
  }

  return NextResponse.json({
    ok: true,
    created,
    updated,
    deactivated,
    failed: failures.length,
    failures: failures.slice(0, 20),
  });
}
