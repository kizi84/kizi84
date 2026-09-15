import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema, firstError } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Невалидна заявка" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  const input = parsed.data;

  await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      subject: input.subject || null,
      body: input.body,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
