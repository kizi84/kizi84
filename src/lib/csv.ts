export type ImportRow = {
  legacyId?: string | null;
  name: string;
  slug?: string | null;
  sku?: string | null;
  price: number;
  oldPrice?: number | null;
  currency?: "EUR" | "BGN";
  stock?: number;
  shortDescription?: string | null;
  description?: string | null;
  images?: string[];
  category?: string | null;
  parentCategory?: string | null;
  brand?: string | null;
  isActive?: boolean;
};

/**
 * Minimal RFC-4180 CSV reader: handles quoted fields, embedded commas,
 * escaped quotes ("") and both CRLF and LF line endings.
 */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === "," || char === ";") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

/** Maps a CSV export onto import rows, tolerating Bulgarian column headings. */
export function parseCsv(text: string): ImportRow[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error("Файлът трябва да съдържа заглавен ред и поне един продукт");

  const aliases: Record<string, string> = {
    име: "name", наименование: "name", продукт: "name",
    цена: "price", "нова цена": "price",
    "стара цена": "oldPrice", "промо цена": "oldPrice",
    валута: "currency", код: "sku", артикул: "sku",
    наличност: "stock", количество: "stock",
    категория: "category", подкcategория: "category",
    "основна категория": "parentCategory",
    марка: "brand", производител: "brand",
    описание: "description", "кратко описание": "shortDescription",
    снимки: "images", снимка: "images",
  };

  const header = rows[0].map((cell) => {
    const key = cell.trim().replace(/^﻿/, "");
    return aliases[key.toLowerCase()] ?? key;
  });

  const nameIndex = header.findIndex((h) => h === "name");
  const priceIndex = header.findIndex((h) => h === "price");

  if (nameIndex === -1 || priceIndex === -1) {
    throw new Error('Липсва колона "name" или "price" в заглавния ред');
  }

  const result: ImportRow[] = [];

  for (const cells of rows.slice(1)) {
    const get = (key: string): string | undefined => {
      const index = header.indexOf(key);
      const value = index === -1 ? undefined : cells[index]?.trim();
      return value === "" ? undefined : value;
    };

    const name = cells[nameIndex]?.trim();
    const price = toNumber(cells[priceIndex]);
    if (!name || price === null) continue;

    const currency = get("currency")?.toUpperCase();
    const active = get("isActive");

    result.push({
      name,
      price,
      oldPrice: toNumber(get("oldPrice")),
      currency: currency === "BGN" ? "BGN" : currency === "EUR" ? "EUR" : undefined,
      legacyId: get("legacyId") ?? null,
      slug: get("slug") ?? null,
      sku: get("sku") ?? null,
      stock: toNumber(get("stock")) ?? 0,
      shortDescription: get("shortDescription") ?? null,
      description: get("description") ?? null,
      images: (get("images") ?? "")
        .split(/[|\n]/)
        .map((url) => url.trim())
        .filter(Boolean),
      category: get("category") ?? null,
      parentCategory: get("parentCategory") ?? null,
      brand: get("brand") ?? null,
      isActive: active === undefined ? true : !["0", "false", "не", "no"].includes(active.toLowerCase()),
    });
  }

  if (result.length === 0) throw new Error("Не бяха разчетени валидни продукти");
  return result;
}
