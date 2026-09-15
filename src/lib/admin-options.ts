import { prisma } from "@/lib/prisma";

/** Category options rendered as a flat, indented tree for <select>. */
export async function getCategoryOptions() {
  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { id: true, name: true, parentId: true },
  });

  const byParent = new Map<string | null, typeof categories>();
  for (const category of categories) {
    const key = category.parentId;
    const bucket = byParent.get(key) ?? [];
    bucket.push(category);
    byParent.set(key, bucket);
  }

  const options: { value: string; label: string }[] = [];

  function walk(parentId: string | null, depth: number) {
    for (const category of byParent.get(parentId) ?? []) {
      options.push({
        value: category.id,
        label: `${"— ".repeat(depth)}${category.name}`,
      });
      walk(category.id, depth + 1);
    }
  }

  walk(null, 0);
  return options;
}

export async function getBrandOptions() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return brands.map((b) => ({ value: b.id, label: b.name }));
}
