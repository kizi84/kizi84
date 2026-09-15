import { z } from "zod";

export const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Въведете име").max(120),
  email: z.string().trim().email("Невалиден имейл адрес").max(160),
  phone: z.string().trim().min(6, "Въведете телефон").max(40),
  city: z.string().trim().min(2, "Въведете град").max(120),
  address: z.string().trim().min(3, "Въведете адрес").max(400),
  postcode: z.string().trim().max(20).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
  deliveryMethod: z.enum(["speedy_office", "speedy_address", "pickup"]),
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variant: z.string().nullable().optional(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Количката е празна")
    .max(60),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().trim().min(2, "Въведете име").max(80),
  email: z.string().trim().email().max(160).optional().or(z.literal("")).nullable(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().or(z.literal("")).nullable(),
  body: z.string().trim().min(10, "Отзивът е твърде кратък").max(3000),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")).nullable(),
  subject: z.string().trim().max(160).optional().or(z.literal("")).nullable(),
  body: z.string().trim().min(10).max(3000),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Въведете име на продукта").max(220),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  sku: z.string().trim().max(80).optional().or(z.literal("")),
  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  description: z.string().trim().max(20000).optional().or(z.literal("")),
  price: z.number().min(0, "Цената не може да е отрицателна"),
  oldPrice: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  trackStock: z.boolean().default(true),
  unit: z.string().trim().max(20).default("бр."),
  weight: z.number().min(0).nullable().optional(),
  images: z.array(z.string()).default([]),
  variants: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        price: z.number().min(0).optional(),
        sku: z.string().trim().max(80).optional(),
        stock: z.number().int().min(0).optional(),
      }),
    )
    .default([]),
  categoryId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(400).optional().or(z.literal("")),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  icon: z.string().trim().max(10).optional().or(z.literal("")),
  image: z.string().trim().max(500).optional().or(z.literal("")),
  parentId: z.string().nullable().optional(),
  position: z.number().int().default(0),
  isActive: z.boolean().default(true),
  showInMenu: z.boolean().default(true),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(400).optional().or(z.literal("")),
});

export const brandSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  logo: z.string().trim().max(500).optional().or(z.literal("")),
});

/** Turns a ZodError into the first readable Bulgarian message for the UI. */
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Невалидни данни";
}
