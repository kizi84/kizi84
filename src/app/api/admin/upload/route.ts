import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import path from "node:path";
import { getSession } from "@/lib/auth";
import { UPLOAD_DIR, UPLOAD_URL_PREFIX } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB per file before processing
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Няма достъп" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Невалидна заявка" }, { status: 400 });

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Не са избрани файлове" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      errors.push(`${file.name}: неподдържан формат`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      errors.push(`${file.name}: файлът е по-голям от 12 MB`);
      continue;
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Normalise every upload to a capped, compressed WebP so product pages
      // stay fast no matter what the shop uploads from a phone camera.
      const processed = await sharp(buffer)
        .rotate()
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      const name = `${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
      await writeFile(path.join(UPLOAD_DIR, name), processed);
      urls.push(`${UPLOAD_URL_PREFIX}/${name}`);
    } catch {
      errors.push(`${file.name}: файлът не можа да бъде обработен`);
    }
  }

  if (urls.length === 0) {
    return NextResponse.json({ error: errors.join("; ") || "Качването се провали" }, { status: 400 });
  }

  return NextResponse.json({ urls, errors }, { status: 201 });
}
