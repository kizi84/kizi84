/**
 * Renders one packshot pair per catalogue item into public/produkti/.
 *
 * Run with `npm run art:products`. The output is committed, so a fresh clone
 * has pictures on every product without running anything.
 */

import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PRODUCTS } from "../prisma/catalog";
import { PALETTES, hash, packshot, type Palette } from "./art-kit";

const OUT_DIR = path.join(process.cwd(), "public", "produkti");

const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s",
  т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht",
  ъ: "a", ь: "y", ю: "yu", я: "ya",
};

const slugify = (input: string) =>
  input.toLowerCase().split("").map((ch) => CYRILLIC[ch] ?? ch).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** A brand's items share a palette so they read as a family on the grid. */
const BRAND_PALETTE: Record<string, string> = {
  "Brit Care": "forest",
  "Brit Premium": "navy",
  "Royal Canin": "crimson",
  Acana: "moss",
  Orijen: "moss",
  Josera: "amber",
  "Happy Dog": "crimson",
  Bosch: "moss",
  Monge: "navy",
  "Farmina N&D": "crimson",
  "Purina Pro Plan": "slate",
  Sanabelle: "plum",
  Whiskas: "plum",
  Felix: "rose",
  Friskies: "sky",
  Pedigree: "amber",
  Trixie: "teal",
  Ferplast: "sky",
  Camon: "clay",
  "Uzunov 90": "leather",
  Beaphar: "sky",
  "Nature's Protection": "moss",
};

const FALLBACK = ["forest", "amber", "navy", "teal", "clay", "moss", "plum", "sky"];

function paletteFor(brand: string | undefined, override: string | undefined, seed: number): Palette {
  if (override && PALETTES[override]) return PALETTES[override];
  const named = brand ? BRAND_PALETTE[brand] : undefined;
  if (named && PALETTES[named]) return PALETTES[named];
  return PALETTES[FALLBACK[seed % FALLBACK.length]];
}

/** The size printed on the packaging: the first variant, or a hint from the name. */
function sizeLabel(name: string, variants?: { label: string }[]): string {
  const fromVariant = variants?.[0]?.label;
  if (fromVariant && /\d/.test(fromVariant)) return fromVariant.replace(/^Размер\s+/, "");
  const inName = name.match(/(\d+[.,]?\d*)\s?(кг|г|мл|л|см|м|броя|бр\.)/);
  return inName ? inName[0] : "";
}

/** Uzunov 90's own brand mark is the one that should read; others get an initial. */
function brandLabel(brand: string | undefined): string {
  if (!brand) return "UZUNOV 90";
  return brand.toUpperCase();
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const file of readdirSync(OUT_DIR)) {
    if (file.endsWith(".webp")) unlinkSync(path.join(OUT_DIR, file));
  }

  let written = 0;
  for (const product of PRODUCTS) {
    const slug = slugify(product.name);
    const seed = hash(slug);
    const pal = paletteFor(product.brand, product.art.palette, seed);
    const ctx = {
      pal,
      brand: brandLabel(product.brand),
      size: sizeLabel(product.name, product.variants),
      motif: product.art.motif ?? "paw",
      seed,
      alt: false,
    };

    for (const [index, alt] of [false, true].entries()) {
      const svg = packshot(product.art.shape, { ...ctx, alt });
      const out = path.join(OUT_DIR, `${slug}-${index + 1}.webp`);
      await sharp(Buffer.from(svg), { density: 144 })
        .resize(1000, 1000)
        .webp({ quality: 86, effort: 5 })
        .toFile(out);
      written += 1;
    }
  }

  console.log(`✔ ${written} изображения за ${PRODUCTS.length} продукта → public/produkti/`);
}

main().catch((error) => {
  console.error("❌ Генерирането се провали:", error);
  process.exit(1);
});
