/**
 * Loads the shop with its category tree, brands, starter catalogue and reviews.
 *
 * The catalogue itself lives in ./catalog.ts so the packshot generator can read
 * the same list. Safe to re-run: everything is upserted by slug/email.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BRANDS, CATEGORIES, PRODUCTS } from "./catalog";

const prisma = new PrismaClient();

const BGN_PER_EUR = 1.95583;
/** Catalogue prices are quoted in лв.; store them in euro. */
const eur = (bgn: number) => Math.round((bgn / BGN_PER_EUR) * 100) / 100;

const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s",
  т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht",
  ъ: "a", ь: "y", ю: "yu", я: "ya",
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .split("")
    .map((ch) => CYRILLIC[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const ART_DIR = path.join(process.cwd(), "public", "produkti");

/** Only reference packshots that are actually on disk, so no frame comes up broken. */
function imagesFor(slug: string): string[] {
  return [1, 2]
    .map((index) => `${slug}-${index}.webp`)
    .filter((file) => existsSync(path.join(ART_DIR, file)))
    .map((file) => `/produkti/${file}`);
}

async function main() {
  console.log("🌱 Зареждане на началните данни…\n");

  /* --------------------------- admin user --------------------------- */
  const email = (process.env.ADMIN_EMAIL || "admin@uzunov90.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Администратор",
      passwordHash: await bcrypt.hash(password, 10),
      role: "admin",
    },
  });
  console.log(`✔ Администратор: ${email}`);

  /* ---------------------------- categories --------------------------- */
  const categoryIdByName = new Map<string, string>();

  for (const [index, seed] of CATEGORIES.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: slugify(seed.name) },
      update: { name: seed.name, icon: seed.icon, description: seed.description, position: index },
      create: {
        slug: slugify(seed.name),
        name: seed.name,
        icon: seed.icon,
        description: seed.description,
        position: index,
      },
    });
    categoryIdByName.set(seed.name, parent.id);

    for (const [childIndex, child] of (seed.children ?? []).entries()) {
      const created = await prisma.category.upsert({
        where: { slug: slugify(child.name) },
        update: { name: child.name, parentId: parent.id, position: childIndex },
        create: {
          slug: slugify(child.name),
          name: child.name,
          parentId: parent.id,
          position: childIndex,
        },
      });
      categoryIdByName.set(child.name, created.id);
    }
  }
  console.log(`✔ Категории: ${categoryIdByName.size}`);

  /* ------------------------------ brands ----------------------------- */
  const brandIdByName = new Map<string, string>();

  for (const brand of BRANDS) {
    const created = await prisma.brand.upsert({
      where: { slug: slugify(brand.name) },
      update: { name: brand.name, description: brand.description },
      create: { slug: slugify(brand.name), name: brand.name, description: brand.description },
    });
    brandIdByName.set(brand.name, created.id);
  }
  console.log(`✔ Марки: ${brandIdByName.size}`);

  /* ----------------------------- products ---------------------------- */
  let withVariants = 0;
  let withImages = 0;

  for (const seed of PRODUCTS) {
    const slug = slugify(seed.name);
    const images = imagesFor(slug);
    const variants = (seed.variants ?? []).map((variant) => ({
      label: variant.label,
      price: eur(variant.bgn),
      stock: variant.stock,
    }));

    if (variants.length) withVariants += 1;
    if (images.length) withImages += 1;

    const data = {
      name: seed.name,
      shortDescription: seed.short,
      description: seed.description,
      price: eur(seed.bgn),
      oldPrice: seed.oldBgn ? eur(seed.oldBgn) : null,
      // With variants the product's own stock is the sum of what the sizes hold.
      stock: variants.length
        ? variants.reduce((total, variant) => total + variant.stock, 0)
        : seed.stock,
      categoryId: categoryIdByName.get(seed.category) ?? null,
      brandId: seed.brand ? (brandIdByName.get(seed.brand) ?? null) : null,
      isFeatured: seed.featured ?? false,
      isNew: seed.isNew ?? false,
      isActive: true,
      images: JSON.stringify(images),
      variants: JSON.stringify(variants),
    };

    await prisma.product.upsert({ where: { slug }, update: data, create: { ...data, slug } });
  }
  console.log(
    `✔ Продукти: ${PRODUCTS.length} (${withVariants} с варианти, ${withImages} със снимки)`,
  );

  /* ------------------------------ reviews ---------------------------- */
  const reviewSeeds = [
    {
      slug: slugify("Усилен нашийник от естествена кожа с двойна катарама"),
      authorName: "Георги Д.",
      rating: 5,
      title: "Най-добрият нашийник, който съм купувал",
      body: "Кучето ми е кангал и къса всичко. Този нашийник е втора година на врата му и изглежда като нов. Кожата е дебела и качествена, катарамите не поддават. Струва си всяка стотинка.",
    },
    {
      slug: slugify("Brit Care Adult Medium Lamb & Rice"),
      authorName: "Мария Петрова",
      rating: 5,
      title: "Проблемите с корема изчезнаха",
      body: "Преминахме на тази храна заради чувствителен стомах. След две седмици разликата беше очевидна — козината стана лъскава и няма повече проблеми с храносмилането.",
    },
    {
      slug: slugify("Сушени телешки дробчета 100 г"),
      authorName: "Ивайло К.",
      rating: 5,
      title: "Върши работа при дресировка",
      body: "Купувам ги редовно. Мирисът е силен и кучето прави всичко за едно парченце. Няма никакви добавки, което е най-важното за мен.",
    },
    {
      slug: slugify("Хигиенни подложки за кучета 60×60 см"),
      authorName: "Десислава М.",
      rating: 4,
      title: "Добро съотношение цена–качество",
      body: "Използвам ги за възрастното ми куче. Поемат добре и не миришат. Единствената забележка е, че биха могли да са малко по-големи.",
    },
    {
      slug: slugify("Кожен повод за разходка"),
      authorName: "Николай С.",
      rating: 5,
      title: "Приятен на допир и издръжлив",
      body: "Кожата омеква с времето и ляга добре в ръката. Карабинерът се върти и поводът не се усуква. Много по-добър от найлоновите.",
    },
    {
      slug: slugify("Фурминатор за къса козина"),
      authorName: "Петя Г.",
      rating: 5,
      title: "Не мога да повярвам колко косми излизат",
      body: "Първия път напълних цяла торбичка. Котката се отпуска, докато я решам, а по дивана вече почти няма косми.",
    },
    {
      slug: slugify("Купа против бързо хранене"),
      authorName: "Стоян В.",
      rating: 4,
      title: "Спря да повръща след ядене",
      body: "Кучето ми гълташе храната за 30 секунди. Сега му отнема 4–5 минути и проблемът с повръщането изчезна. Единствено е малко досадна за миене.",
    },
    {
      slug: slugify("Кожен хамут за гърди"),
      authorName: "Елена Т.",
      rating: 5,
      title: "Качество, каквото не се среща в големите вериги",
      body: "Взех го от магазина на Братя Миладинови и ми помогнаха да премеря кучето на място. Хамутът стои идеално и кожата е много по-дебела от това, което продават другаде.",
    },
    {
      slug: slugify("Royal Canin Urinary Care — котешка диета"),
      authorName: "Радослав Н.",
      rating: 5,
      title: "След два епизода с кристали — нито един повече",
      body: "Ветеринарят ни я препоръча. От година и половина котаракът е на нея и няма повторение на проблема.",
    },
    {
      slug: slugify("Интерактивна дъска-пъзел за кучета"),
      authorName: "Виктория А.",
      rating: 4,
      title: "Изморява го повече от разходка",
      body: "След 15 минути с дъската кучето заспива. Реши я твърде бързо обаче — следващия път ще взема по-трудна.",
    },
  ];

  for (const seed of reviewSeeds) {
    const product = await prisma.product.findUnique({
      where: { slug: seed.slug },
      select: { id: true },
    });
    if (!product) {
      console.warn(`  ⚠ Отзив без продукт: ${seed.slug}`);
      continue;
    }

    const exists = await prisma.review.findFirst({
      where: { productId: product.id, authorName: seed.authorName },
      select: { id: true },
    });
    if (exists) continue;

    await prisma.review.create({
      data: {
        productId: product.id,
        authorName: seed.authorName,
        rating: seed.rating,
        title: seed.title,
        body: seed.body,
        status: "approved",
      },
    });
  }

  // Refresh the cached rating on every product that now has reviews.
  const rated = await prisma.review.groupBy({
    by: ["productId"],
    where: { status: "approved" },
    _avg: { rating: true },
    _count: { rating: true },
  });

  for (const row of rated) {
    await prisma.product.update({
      where: { id: row.productId },
      data: {
        ratingAvg: Math.round((row._avg.rating ?? 0) * 10) / 10,
        ratingCount: row._count.rating,
      },
    });
  }
  console.log(`✔ Отзиви: ${rated.length} продукта с оценки`);

  console.log(`
✅ Готово.

   Админ панел : /admin
   Имейл       : ${email}
   Парола      : ${password}

   ⚠  Сменете паролата преди публикуване на сайта.
`);
}

main()
  .catch((error) => {
    console.error("❌ Зареждането се провали:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
