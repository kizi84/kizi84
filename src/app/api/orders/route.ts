import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema, firstError } from "@/lib/validation";
import { DELIVERY_METHODS, SHIPPING } from "@/lib/constants";
import { parseImages, parseVariants } from "@/lib/utils";

export const runtime = "nodejs";

/** UZ-2026-0001 — sequential within the calendar year. */
async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `UZ-${year}-`;

  const last = await prisma.order.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  const lastSeq = last ? Number(last.number.slice(prefix.length)) : 0;
  return `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Невалидна заявка" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  const input = parsed.data;

  // Prices always come from the database, never from the client payload.
  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, isActive: true },
  });

  if (products.length === 0) {
    return NextResponse.json({ error: "Продуктите вече не са налични" }, { status: 400 });
  }

  const productById = new Map(products.map((p) => [p.id, p]));

  const items = input.items.flatMap((item) => {
    const product = productById.get(item.productId);
    if (!product) return [];

    const variants = parseVariants(product.variants);
    const variant = item.variant ? variants.find((v) => v.label === item.variant) : undefined;
    const price = variant?.price ?? product.price;

    return [{
      productId: product.id,
      name: product.name,
      variant: variant?.label ?? null,
      price,
      quantity: item.quantity,
      image: parseImages(product.images)[0] ?? null,
    }];
  });

  if (items.length === 0) {
    return NextResponse.json({ error: "Продуктите вече не са налични" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const method = DELIVERY_METHODS.find((m) => m.value === input.deliveryMethod);
  const shipping =
    input.deliveryMethod === "pickup" || subtotal >= SHIPPING.countryFreeOver
      ? 0
      : (method?.rate ?? SHIPPING.officeRate);

  const number = await nextOrderNumber();

  const order = await prisma.order.create({
    data: {
      number,
      customerName: input.customerName,
      email: input.email,
      phone: input.phone,
      city: input.city,
      address: input.address,
      postcode: input.postcode || null,
      note: input.note || null,
      deliveryMethod: input.deliveryMethod,
      paymentMethod: input.paymentMethod,
      subtotal,
      shipping,
      total: subtotal + shipping,
      items: { create: items },
    },
    select: { number: true, total: true },
  });

  // Best-effort stock and sales bookkeeping — a failure here must not lose the order.
  await Promise.all(
    items.map((item) =>
      prisma.product
        .update({
          where: { id: item.productId },
          data: {
            soldCount: { increment: item.quantity },
            ...(productById.get(item.productId)?.trackStock
              ? { stock: { decrement: item.quantity } }
              : {}),
          },
        })
        .catch(() => {}),
    ),
  );

  return NextResponse.json({ number: order.number, total: order.total }, { status: 201 });
}
