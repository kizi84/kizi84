import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewSchema, firstError } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Невалидна заявка" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  const input = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Продуктът не е намерен" }, { status: 404 });
  }

  // Reviews stay hidden until an admin approves them.
  await prisma.review.create({
    data: {
      productId: product.id,
      authorName: input.authorName,
      email: input.email || null,
      rating: input.rating,
      title: input.title || null,
      body: input.body,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
