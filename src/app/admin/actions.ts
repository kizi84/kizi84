"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { refreshProductRating } from "@/lib/queries";
import { slugify } from "@/lib/utils";
import {
  brandSchema, categorySchema, productSchema, firstError,
} from "@/lib/validation";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

/** Makes a slug unique by appending -2, -3, … when the base is taken. */
async function uniqueSlug(
  base: string,
  model: "product" | "category" | "brand",
  ignoreId?: string,
): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let suffix = 1;

  for (;;) {
    const existing =
      model === "product"
        ? await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })
        : model === "category"
          ? await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } })
          : await prisma.brand.findUnique({ where: { slug: candidate }, select: { id: true } });

    if (!existing || existing.id === ignoreId) return candidate;
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
}

function num(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/* ------------------------------ Products ------------------------------ */

export async function saveProduct(formData: FormData): Promise<ActionResult> {
  await requireSession();

  const id = str(formData.get("id"));

  let images: string[] = [];
  let variants: { label: string; price?: number; sku?: string; stock?: number }[] = [];
  try {
    images = JSON.parse(str(formData.get("images")) || "[]");
    variants = JSON.parse(str(formData.get("variants")) || "[]");
  } catch {
    return { ok: false, error: "Невалидни данни за снимки или варианти" };
  }

  const parsed = productSchema.safeParse({
    name: str(formData.get("name")),
    slug: str(formData.get("slug")),
    sku: str(formData.get("sku")),
    shortDescription: str(formData.get("shortDescription")),
    description: str(formData.get("description")),
    price: num(formData.get("price")) ?? 0,
    oldPrice: num(formData.get("oldPrice")),
    stock: num(formData.get("stock")) ?? 0,
    trackStock: bool(formData.get("trackStock")),
    unit: str(formData.get("unit")) || "бр.",
    weight: num(formData.get("weight")),
    images,
    variants,
    categoryId: str(formData.get("categoryId")) || null,
    brandId: str(formData.get("brandId")) || null,
    isActive: bool(formData.get("isActive")),
    isFeatured: bool(formData.get("isFeatured")),
    isNew: bool(formData.get("isNew")),
    seoTitle: str(formData.get("seoTitle")),
    seoDescription: str(formData.get("seoDescription")),
  });

  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const input = parsed.data;

  const slug = await uniqueSlug(input.slug || input.name, "product", id || undefined);

  const data = {
    name: input.name,
    slug,
    sku: input.sku || null,
    shortDescription: input.shortDescription || null,
    description: input.description || null,
    price: input.price,
    oldPrice: input.oldPrice ?? null,
    stock: Math.trunc(input.stock),
    trackStock: input.trackStock,
    unit: input.unit,
    weight: input.weight ?? null,
    images: JSON.stringify(input.images),
    variants: JSON.stringify(input.variants),
    categoryId: input.categoryId || null,
    brandId: input.brandId || null,
    isActive: input.isActive,
    isFeatured: input.isFeatured,
    isNew: input.isNew,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };

  try {
    const product = id
      ? await prisma.product.update({ where: { id }, data })
      : await prisma.product.create({ data });

    revalidatePath("/admin/produkti");
    revalidatePath("/");
    revalidatePath(`/produkt/${product.slug}`);
    return { ok: true, id: product.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unique constraint") && message.includes("sku")) {
      return { ok: false, error: "Вече съществува продукт с този код (SKU)" };
    }
    return { ok: false, error: "Продуктът не можа да бъде записан" };
  }
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData.get("id"));
  if (!id) return;

  await prisma.product.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/produkti");
  revalidatePath("/");
  redirect("/admin/produkti");
}

export async function toggleProductFlag(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData.get("id"));
  const field = str(formData.get("field"));
  if (!id || !["isActive", "isFeatured", "isNew"].includes(field)) return;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  await prisma.product.update({
    where: { id },
    data: { [field]: !product[field as "isActive" | "isFeatured" | "isNew"] },
  });

  revalidatePath("/admin/produkti");
  revalidatePath("/");
}

/* ----------------------------- Categories ----------------------------- */

export async function saveCategory(formData: FormData): Promise<ActionResult> {
  await requireSession();

  const id = str(formData.get("id"));

  const parsed = categorySchema.safeParse({
    name: str(formData.get("name")),
    slug: str(formData.get("slug")),
    description: str(formData.get("description")),
    icon: str(formData.get("icon")),
    image: str(formData.get("image")),
    parentId: str(formData.get("parentId")) || null,
    position: num(formData.get("position")) ?? 0,
    isActive: bool(formData.get("isActive")),
    showInMenu: bool(formData.get("showInMenu")),
    seoTitle: str(formData.get("seoTitle")),
    seoDescription: str(formData.get("seoDescription")),
  });

  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const input = parsed.data;

  // A category can't be its own parent.
  const parentId = input.parentId && input.parentId !== id ? input.parentId : null;
  const slug = await uniqueSlug(input.slug || input.name, "category", id || undefined);

  const data = {
    name: input.name,
    slug,
    description: input.description || null,
    icon: input.icon || null,
    image: input.image || null,
    parentId,
    position: Math.trunc(input.position),
    isActive: input.isActive,
    showInMenu: input.showInMenu,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };

  const category = id
    ? await prisma.category.update({ where: { id }, data })
    : await prisma.category.create({ data });

  revalidatePath("/admin/kategorii");
  revalidatePath("/", "layout");
  return { ok: true, id: category.id };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData.get("id"));
  if (!id) return;

  // Products keep existing; their categoryId is cleared by the schema's SetNull rule.
  await prisma.category.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/kategorii");
  revalidatePath("/", "layout");
}

/* ------------------------------- Brands ------------------------------- */

export async function saveBrand(formData: FormData): Promise<ActionResult> {
  await requireSession();

  const id = str(formData.get("id"));

  const parsed = brandSchema.safeParse({
    name: str(formData.get("name")),
    slug: str(formData.get("slug")),
    description: str(formData.get("description")),
    logo: str(formData.get("logo")),
  });

  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const input = parsed.data;

  const slug = await uniqueSlug(input.slug || input.name, "brand", id || undefined);

  const data = {
    name: input.name,
    slug,
    description: input.description || null,
    logo: input.logo || null,
  };

  const brand = id
    ? await prisma.brand.update({ where: { id }, data })
    : await prisma.brand.create({ data });

  revalidatePath("/admin/marki");
  revalidatePath("/marki");
  return { ok: true, id: brand.id };
}

export async function deleteBrand(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData.get("id"));
  if (!id) return;

  await prisma.brand.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/marki");
  revalidatePath("/marki");
}

/* ------------------------------- Orders ------------------------------- */

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireSession();

  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  const allowed = ["new", "confirmed", "shipped", "delivered", "cancelled"];
  if (!id || !allowed.includes(status)) return;

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/porachki");
  revalidatePath(`/admin/porachki/${id}`);
  revalidatePath("/admin");
}

export async function saveOrderNote(formData: FormData): Promise<void> {
  await requireSession();

  const id = str(formData.get("id"));
  if (!id) return;

  await prisma.order.update({
    where: { id },
    data: { adminNote: str(formData.get("adminNote")) || null },
  });
  revalidatePath(`/admin/porachki/${id}`);
}

export async function deleteOrder(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData.get("id"));
  if (!id) return;

  await prisma.order.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/porachki");
  redirect("/admin/porachki");
}

/* ------------------------------- Reviews ------------------------------ */

export async function setReviewStatus(formData: FormData): Promise<void> {
  await requireSession();

  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  if (!id || !["pending", "approved", "rejected"].includes(status)) return;

  const review = await prisma.review.update({
    where: { id },
    data: { status },
    select: { productId: true, product: { select: { slug: true } } },
  });

  await refreshProductRating(review.productId);

  revalidatePath("/admin/otzivi");
  revalidatePath("/admin");
  revalidatePath(`/produkt/${review.product.slug}`);
}

export async function deleteReview(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData.get("id"));
  if (!id) return;

  const review = await prisma.review.findUnique({
    where: { id },
    select: { productId: true },
  });
  if (!review) return;

  await prisma.review.delete({ where: { id } });
  await refreshProductRating(review.productId);

  revalidatePath("/admin/otzivi");
  revalidatePath("/admin");
}

/* ------------------------------ Messages ------------------------------ */

export async function markMessageRead(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData.get("id"));
  if (!id) return;

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) return;

  await prisma.contactMessage.update({
    where: { id },
    data: { isRead: !message.isRead },
  });
  revalidatePath("/admin/sabshteniya");
  revalidatePath("/admin");
}

export async function deleteMessage(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData.get("id"));
  if (!id) return;

  await prisma.contactMessage.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/sabshteniya");
  revalidatePath("/admin");
}

/* ---------------------- plain-form action wrappers --------------------- */
/*
 * The category and brand screens post with a plain <form action={...}>, which
 * requires a void-returning action. These wrappers redirect back to the list —
 * carrying an `error` query parameter when validation fails.
 */

export async function saveCategoryForm(formData: FormData): Promise<void> {
  const result = await saveCategory(formData);
  redirect(result.ok ? "/admin/kategorii" : `/admin/kategorii?error=${encodeURIComponent(result.error)}`);
}

export async function saveBrandForm(formData: FormData): Promise<void> {
  const result = await saveBrand(formData);
  redirect(result.ok ? "/admin/marki" : `/admin/marki?error=${encodeURIComponent(result.error)}`);
}
