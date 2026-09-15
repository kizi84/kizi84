/**
 * Scraper for the legacy uzunov90.com shop.
 *
 * The old site is a classic PHP catalogue: categories live at
 * `browse.php?catid=N` (paged with `&start=`) and products at `product.php?id=N`.
 * This script crawls both, extracts name / price / description / images, and
 * writes `products.json` next to the project root.
 *
 * Run it from a machine that can reach the old site:
 *
 *   npm run import:legacy
 *   npm run import:legacy -- --base https://www.uzunov90.com --out products.json
 *   npm run import:legacy -- --max-products 50        # quick trial run
 *
 * Then upload the resulting file in the admin panel under "Импорт на продукти",
 * or POST it straight to /api/admin/import.
 *
 * Nothing is written to the database here — review the JSON first.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";

type Args = Record<string, string | boolean>;

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const BASE = String(args.base ?? "https://www.uzunov90.com").replace(/\/$/, "");
const OUT = String(args.out ?? "products.json");
const MAX_PRODUCTS = Number(args["max-products"] ?? 0) || Infinity;
const DELAY_MS = Number(args.delay ?? 350);
const CONCURRENCY = Math.max(1, Number(args.concurrency ?? 3));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchHtml(url: string, attempt = 1): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Uzunov90Migration/1.0)",
        "Accept-Language": "bg,en;q=0.8",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      if (res.status >= 500 && attempt < 3) {
        await sleep(1000 * attempt);
        return fetchHtml(url, attempt + 1);
      }
      return null;
    }

    // The legacy site is windows-1251 in places; decode accordingly.
    const buffer = Buffer.from(await res.arrayBuffer());
    const head = buffer.subarray(0, 2048).toString("latin1").toLowerCase();
    const charset = /charset=["']?([\w-]+)/.exec(head)?.[1] ?? "utf-8";

    try {
      return new TextDecoder(charset).decode(buffer);
    } catch {
      return buffer.toString("utf-8");
    }
  } catch {
    if (attempt < 3) {
      await sleep(1000 * attempt);
      return fetchHtml(url, attempt + 1);
    }
    return null;
  }
}

function decodeEntities(input: string): string {
  const named: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    laquo: "«", raquo: "»", bdquo: "„", ldquo: "“", rdquo: "”", ndash: "–", mdash: "—",
  };
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h\d)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

function absolute(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `${BASE}/${url.replace(/^\.?\//, "")}`;
}

function matchAll(html: string, pattern: RegExp): string[] {
  return [...html.matchAll(pattern)].map((m) => m[1]);
}

/* ------------------------- discovery ------------------------- */

async function discoverCategoryIds(): Promise<string[]> {
  const ids = new Set<string>();
  const seeds = [`${BASE}/`, `${BASE}/index.php`, `${BASE}/shop/`];

  for (const seed of seeds) {
    const html = await fetchHtml(seed);
    if (!html) continue;
    for (const id of matchAll(html, /browse\.php\?catid=(\d+)/gi)) ids.add(id);
  }

  // Walk one level deeper: category pages list their sub-categories.
  for (const id of [...ids]) {
    const html = await fetchHtml(`${BASE}/browse.php?catid=${id}`);
    if (!html) continue;
    for (const child of matchAll(html, /browse\.php\?catid=(\d+)/gi)) ids.add(child);
    await sleep(DELAY_MS);
  }

  return [...ids];
}

async function collectProductIds(categoryIds: string[]): Promise<Map<string, string | null>> {
  // productId -> categoryId it was first seen in
  const found = new Map<string, string | null>();

  for (const catid of categoryIds) {
    let start = 0;
    let guard = 0;

    for (;;) {
      guard += 1;
      if (guard > 60) break; // safety net against an endless pager

      const url = start === 0
        ? `${BASE}/browse.php?catid=${catid}`
        : `${BASE}/browse.php?start=${start}&catid=${catid}`;

      const html = await fetchHtml(url);
      if (!html) break;

      const ids = matchAll(html, /product\.php\?id=(\d+)/gi);
      const fresh = ids.filter((id) => !found.has(id));
      for (const id of ids) if (!found.has(id)) found.set(id, catid);

      process.stdout.write(
        `\r  категория ${catid}: ${found.size} продукта намерени общо   `,
      );

      // Stop when a page adds nothing new — the pager has wrapped or ended.
      if (ids.length === 0 || fresh.length === 0) break;
      start += 10;
      await sleep(DELAY_MS);
    }
  }

  process.stdout.write("\n");
  return found;
}

/* ------------------------- extraction ------------------------- */

type ScrapedProduct = {
  legacyId: string;
  name: string;
  sku: string | null;
  price: number;
  oldPrice: number | null;
  currency: "BGN";
  stock: number;
  description: string | null;
  images: string[];
  category: string | null;
  parentCategory: string | null;
  brand: string | null;
  sourceUrl: string;
};

function extractName(html: string): string | null {
  const og = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
  if (og) return decodeEntities(og).trim();

  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1];
  if (h1) {
    const text = stripTags(h1);
    if (text) return text;
  }

  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  if (title) {
    // Titles read "Product name - Храни, Дрехи, Играчки за Вашето Куче и Котка"
    return decodeEntities(title).split(/\s+[-–|]\s+/)[0].trim();
  }
  return null;
}

function extractPrices(html: string): { price: number | null; oldPrice: number | null } {
  const text = stripTags(html);
  const matches = [...text.matchAll(/(\d+(?:[.,]\d{1,2})?)\s*(?:лв\.?|BGN|€|EUR)/gi)]
    .map((m) => Number(m[1].replace(",", ".")))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 100000);

  if (matches.length === 0) return { price: null, oldPrice: null };
  if (matches.length === 1) return { price: matches[0], oldPrice: null };

  // A promo block shows the old price next to the new one; the lower is current.
  const [first, second] = matches;
  if (second > first) return { price: first, oldPrice: second };
  if (first > second) return { price: second, oldPrice: first };
  return { price: first, oldPrice: null };
}

function extractImages(html: string): string[] {
  const urls = new Set<string>();

  const og = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
  if (og) urls.add(absolute(decodeEntities(og)));

  for (const src of matchAll(html, /<img[^>]+src=["']([^"']+)["']/gi)) {
    const url = decodeEntities(src);
    // Skip layout chrome: spacers, buttons, icons, logos.
    if (/(spacer|pixel|blank|button|btn|icon|logo|banner|arrow|bullet|cart|flag)/i.test(url)) continue;
    if (!/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) continue;
    urls.add(absolute(url));
  }

  // Prefer full-size images over thumbnails where both exist.
  return [...urls]
    .sort((a, b) => Number(/thumb|small|_s\./i.test(a)) - Number(/thumb|small|_s\./i.test(b)))
    .slice(0, 8);
}

function extractDescription(html: string): string | null {
  const og = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
  const body = stripTags(html);

  // Trim the boilerplate that wraps every legacy page.
  const cleaned = body
    .split("\n")
    .filter((line) => {
      const l = line.trim();
      if (l.length < 3) return false;
      return !/^(начало|кошница|за търговци|контакти|доставка|вход|регистрация|търсене|категории|© )/i.test(l);
    })
    .join("\n")
    .trim();

  const description = cleaned.length > 40 ? cleaned.slice(0, 4000) : null;
  return description ?? (og ? decodeEntities(og) : null);
}

function extractSku(html: string, name: string): string | null {
  const fromText = /(?:код|артикул|sku)[:\s]*([\w-]{2,20})/i.exec(stripTags(html))?.[1];
  if (fromText) return fromText;

  // Legacy names often end with the supplier code in brackets, e.g. "(1153)".
  const fromName = /\((\d{3,8})\)\s*$/.exec(name)?.[1];
  return fromName ?? null;
}

const KNOWN_BRANDS = [
  "Brit Care", "Brit Premium", "Brit", "Royal Canin", "Acana", "Orijen", "Purina",
  "Pro Plan", "Josera", "Happy Dog", "Happy Cat", "Bosch", "Monge", "Farmina",
  "Hill's", "Eukanuba", "Pedigree", "Whiskas", "Friskies", "Felix", "Gourmet",
  "Sheba", "Perfect Fit", "Dolina", "Nature's Protection", "Carnilove", "Trixie",
  "Ferplast", "Beaphar", "Kong", "Мяу", "Бисер", "Дог Чау", "Мура",
];

function extractBrand(name: string, html: string): string | null {
  const haystack = `${name} ${stripTags(html).slice(0, 600)}`;
  for (const brand of KNOWN_BRANDS) {
    if (new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(haystack)) {
      return brand;
    }
  }
  return null;
}

function extractCategoryPath(html: string): { category: string | null; parent: string | null } {
  // Breadcrumbs are rendered as a chain of browse.php links.
  const links = [...html.matchAll(/<a[^>]+href=["'][^"']*browse\.php\?catid=\d+[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => stripTags(m[1]))
    .filter((text) => text.length > 1 && text.length < 60);

  const unique = [...new Set(links)];
  if (unique.length === 0) return { category: null, parent: null };
  if (unique.length === 1) return { category: unique[0], parent: null };

  return { category: unique[unique.length - 1], parent: unique[unique.length - 2] };
}

async function scrapeProduct(id: string): Promise<ScrapedProduct | null> {
  const url = `${BASE}/product.php?id=${id}`;
  const html = await fetchHtml(url);
  if (!html) return null;

  const name = extractName(html);
  if (!name) return null;

  const { price, oldPrice } = extractPrices(html);
  if (price === null) return null;

  const { category, parent } = extractCategoryPath(html);

  return {
    legacyId: id,
    name,
    sku: extractSku(html, name),
    price,
    oldPrice,
    currency: "BGN", // legacy prices are in лв.; the importer converts to EUR
    stock: 10,
    description: extractDescription(html),
    images: extractImages(html),
    category,
    parentCategory: parent,
    brand: extractBrand(name, html),
    sourceUrl: url,
  };
}

/* ------------------------- main ------------------------- */

async function main() {
  console.log(`\n🐾 Импорт от ${BASE}\n`);

  console.log("1/3  Откриване на категории…");
  const categoryIds = await discoverCategoryIds();
  console.log(`     ${categoryIds.length} категории.`);

  if (categoryIds.length === 0) {
    console.error(
      "\n❌ Не бяха открити категории. Проверете дали сайтът е достъпен от тази машина\n" +
      "   и дали адресът е правилен (--base https://www.uzunov90.com).\n",
    );
    process.exit(1);
  }

  console.log("\n2/3  Събиране на продуктови адреси…");
  const productMap = await collectProductIds(categoryIds);
  const productIds = [...productMap.keys()].slice(0, MAX_PRODUCTS);
  console.log(`     ${productIds.length} продукта за сваляне.`);

  console.log("\n3/3  Сваляне на продуктите…");
  const products: ScrapedProduct[] = [];
  const failed: string[] = [];

  for (let i = 0; i < productIds.length; i += CONCURRENCY) {
    const batch = productIds.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((id) => scrapeProduct(id)));

    results.forEach((product, index) => {
      if (product) products.push(product);
      else failed.push(batch[index]);
    });

    process.stdout.write(
      `\r     ${products.length}/${productIds.length} свалени, ${failed.length} пропуснати   `,
    );
    await sleep(DELAY_MS);
  }

  process.stdout.write("\n");

  const outPath = path.resolve(process.cwd(), OUT);
  await writeFile(outPath, JSON.stringify({ products }, null, 2), "utf-8");

  const withImages = products.filter((p) => p.images.length > 0).length;
  const withBrand = products.filter((p) => p.brand).length;

  console.log(`
✅ Готово.

   Записан файл : ${outPath}
   Продукти     : ${products.length}
   Със снимки   : ${withImages}
   С марка      : ${withBrand}
   Пропуснати   : ${failed.length}${failed.length ? ` (id: ${failed.slice(0, 10).join(", ")}${failed.length > 10 ? "…" : ""})` : ""}

   Следваща стъпка: отворете /admin/import, качете ${OUT} и прегледайте
   данните преди да потвърдите. Цените са в лева и се превалутират
   автоматично в евро по фиксирания курс.
`);
}

main().catch((error) => {
  console.error("\n❌ Импортът се провали:", error);
  process.exit(1);
});
