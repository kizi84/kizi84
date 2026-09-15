/**
 * Seeds the shop with its category tree, brands and a starter catalogue.
 *
 * The categories, brands and price levels mirror the real Uzunov 90 range so
 * the site is usable immediately; the full product list is then brought over
 * with `npm run import:legacy` + the admin import screen.
 *
 * Safe to re-run: everything is upserted by slug/email.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BGN_PER_EUR = 1.95583;
/** Legacy prices are quoted in лв.; store them in euro. */
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

type CategorySeed = {
  name: string;
  icon?: string;
  description?: string;
  children?: { name: string; icon?: string }[];
};

const CATEGORIES: CategorySeed[] = [
  {
    name: "Храна за кучета",
    icon: "🐕",
    description:
      "Суха и мокра храна за кучета от всички възрасти и породи — от малко кученце до възрастно куче с особени нужди.",
    children: [
      { name: "Суха храна за кучета" },
      { name: "Консерви и пауч за кучета" },
      { name: "Храна за кученца" },
      { name: "Диетична храна за кучета" },
    ],
  },
  {
    name: "Храна за котки",
    icon: "🐈",
    description:
      "Суха и мокра храна за котки — балансирани формули за всяка възраст и начин на живот.",
    children: [
      { name: "Суха храна за котки" },
      { name: "Консерви и пауч за котки" },
      { name: "Храна за котенца" },
    ],
  },
  {
    name: "Лакомства",
    icon: "🦴",
    description:
      "Награди за обучение, дъвчащи кокали и деликатеси за кучета и котки.",
    children: [
      { name: "Лакомства за кучета" },
      { name: "Лакомства за котки" },
      { name: "Кокали и дъвчащи" },
    ],
  },
  {
    name: "Аксесоари за кучета",
    icon: "🪢",
    description:
      "Нашийници, поводи, намордници и хамути от естествена кожа — собствено българско производство, изработени на ръка.",
    children: [
      { name: "Нашийници от естествена кожа" },
      { name: "Поводи" },
      { name: "Намордници" },
      { name: "Хамути и автоматични повода" },
    ],
  },
  {
    name: "Аксесоари за котки",
    icon: "🐾",
    description: "Котешки тоалетни, драскала, гребени и купички.",
    children: [
      { name: "Тоалетни и постелки" },
      { name: "Драскала" },
      { name: "Купички за котки" },
    ],
  },
  {
    name: "Хигиена и козметика",
    icon: "🧴",
    description:
      "Шампоани, парфюми, пелени и хигиенни подложки за ежедневната грижа.",
    children: [
      { name: "Шампоани и парфюми" },
      { name: "Пелени и подложки" },
      { name: "Гребени и четки" },
    ],
  },
  {
    name: "Играчки",
    icon: "🎾",
    description: "Играчки за кучета и котки — за игра, дъвчене и обучение.",
    children: [{ name: "Играчки за кучета" }, { name: "Играчки за котки" }],
  },
  {
    name: "Дрехи",
    icon: "🧥",
    description: "Дрешки за кучета — за студените и дъждовните дни.",
    children: [{ name: "Дрехи за кучета" }, { name: "Дрехи за котки" }],
  },
];

const BRANDS = [
  { name: "Brit Care", description: "Чешка марка супер-премиум храни с високо съдържание на месо." },
  { name: "Brit Premium", description: "Балансирани храни на достъпна цена от чешкия производител Brit." },
  { name: "Royal Canin", description: "Френски производител с формули, специализирани по порода, възраст и здравословно състояние." },
  { name: "Acana", description: "Канадски био-подходящи храни с високо съдържание на прясно месо." },
  { name: "Josera", description: "Немско семейно производство с над 80 години традиция." },
  { name: "Happy Dog", description: "Немски храни с рецепти по региони и специални формули." },
  { name: "Monge", description: "Италиански храни с натурални съставки." },
  { name: "Purina Pro Plan", description: "Ветеринарно разработени формули за всяка възраст." },
  { name: "Whiskas", description: "Достъпни храни и пауч за котки." },
  { name: "Trixie", description: "Немски производител на аксесоари и играчки." },
  { name: "Uzunov 90", description: "Собствено производство — кучешки аксесоари от естествена телешка кожа, ръчна изработка." },
  { name: "Beaphar", description: "Холандска козметика и препарати за домашни любимци." },
];

type ProductSeed = {
  name: string;
  category: string;
  brand?: string;
  bgn: number;
  oldBgn?: number;
  stock: number;
  short: string;
  description: string;
  featured?: boolean;
  isNew?: boolean;
  variants?: { label: string; price?: number; stock?: number }[];
};

const PRODUCTS: ProductSeed[] = [
  {
    name: "Brit Care Adult Medium Lamb & Rice 12 кг",
    category: "Суха храна за кучета",
    brand: "Brit Care",
    bgn: 102,
    oldBgn: 118,
    stock: 8,
    short: "Хипоалергенна храна с агнешко и ориз за кучета от средни породи.",
    description:
      "Пълноценна хипоалергенна храна за възрастни кучета от средни породи (10–25 кг).\n\nАгнешкото месо е източник на лесноусвоим протеин, подходящ за кучета с чувствително храносмилане. Оризът осигурява бавно освобождаваща се енергия без натоварване на стомаха.\n\nСъстав: обезводнено агнешко месо (40%), ориз, пилешка мазнина, сушени ябълки, пивна мая, ленено семе, сьомгово масло, хидролизирани миди, юка шидигера.\n\nАналитични съставки: протеин 24%, мазнини 14%, влакнини 2,5%, влага 10%.\n\nНачин на хранене: 250–380 г дневно в зависимост от теглото, разделено на две хранения. Осигурете постоянен достъп до прясна вода.",
    featured: true,
    variants: [
      { label: "3 кг", price: eur(32), stock: 12 },
      { label: "12 кг", price: eur(102), stock: 8 },
    ],
  },
  {
    name: "Brit Premium Adult Large Breed 15 кг",
    category: "Суха храна за кучета",
    brand: "Brit Premium",
    bgn: 94.5,
    stock: 6,
    short: "Храна за едри породи с глюкозамин за здрави стави.",
    description:
      "Пълноценна храна за възрастни кучета от едри породи над 25 кг.\n\nОбогатена с глюкозамин и хондроитин за поддържане на ставите — от съществено значение при по-едрите породи, чиито стави носят по-голямо натоварване.\n\nАналитични съставки: протеин 25%, мазнини 14%, влакнини 2,5%.\n\nНачин на хранене: 400–560 г дневно според теглото на кучето.",
    featured: true,
  },
  {
    name: "Royal Canin Maxi Adult 15 кг",
    category: "Суха храна за кучета",
    brand: "Royal Canin",
    bgn: 178,
    stock: 4,
    short: "Специализирана формула за едри породи от 15 месеца до 5 години.",
    description:
      "Храна за кучета от едри породи (26–44 кг) на възраст между 15 месеца и 5 години.\n\nГранулата е с форма и размер, съобразени с челюстта на едрите породи, което стимулира дъвченето и забавя приема на храна.\n\nСъдържа комплекс от антиоксиданти и EPA/DHA за поддържане на костите и ставите.",
    featured: true,
  },
  {
    name: "Josera Optiness Adult 15 кг",
    category: "Суха храна за кучета",
    brand: "Josera",
    bgn: 148,
    oldBgn: 165,
    stock: 5,
    short: "Храна с намалено съдържание на протеин за нормално активни кучета.",
    description:
      "Немско качество за кучета с умерена активност. Намаленото съдържание на протеин щади бъбреците, без да лишава кучето от необходимите хранителни вещества.\n\nБез соя, без изкуствени оцветители и консерванти.",
  },
  {
    name: "Acana Wild Prairie Dog 11,4 кг",
    category: "Суха храна за кучета",
    brand: "Acana",
    bgn: 245,
    stock: 3,
    short: "Био-подходяща храна с 70% прясно месо от свободно отглеждани птици.",
    description:
      "Храна без зърнени култури с високо съдържание на прясно месо от пиле, пуйка, яйца и пъстърва.\n\nСъстав: 70% месни съставки, 30% плодове и зеленчуци, 0% зърнени култури.\n\nПодходяща за кучета от всички възрасти и породи.",
    isNew: true,
  },
  {
    name: "Happy Dog Mini Baby & Junior 4 кг",
    category: "Храна за кученца",
    brand: "Happy Dog",
    bgn: 78,
    stock: 9,
    short: "Първа твърда храна за кученца от дребни породи до 12 месеца.",
    description:
      "Специално разработена за малки кученца от дребни породи (до 10 кг в зряла възраст).\n\nМалката гранула е лесна за дъвчене, а балансираното съотношение калций и фосфор подпомага правилното развитие на костите.\n\nСъдържа пребиотици за изграждане на здрава чревна флора.",
  },
  {
    name: "Monge Dog Monoprotein Adult с патица и ориз 12 кг",
    category: "Диетична храна за кучета",
    brand: "Monge",
    bgn: 132,
    stock: 4,
    short: "Монопротеинова формула за кучета с хранителни алергии.",
    description:
      "Един-единствен животински източник на протеин — патешко месо — което прави храната подходяща за кучета с хранителна непоносимост.\n\nБез пилешко, без говеждо, без соя.",
  },
  {
    name: "Royal Canin Indoor 27 — суха храна за котки 4 кг",
    category: "Суха храна за котки",
    brand: "Royal Canin",
    bgn: 84.5,
    stock: 11,
    short: "За котки, живеещи изцяло на закрито, с контрол на космените топки.",
    description:
      "Формула за домашни котки на възраст 1–7 години, които прекарват времето си на закрито.\n\nПовишеното съдържание на фибри подпомага естественото изхвърляне на погълнатите косми. Умереното калорийно съдържание помага за поддържане на теглото при по-ниска физическа активност.",
    featured: true,
  },
  {
    name: "Brit Care Cat Haircare 7 кг",
    category: "Суха храна за котки",
    brand: "Brit Care",
    bgn: 138,
    stock: 5,
    short: "За здрава и лъскава козина, с високо съдържание на сьомга.",
    description:
      "Храна без зърнени култури за възрастни котки, разработена за поддържане на кожата и козината.\n\nСьомговото масло и ленените семена доставят Омега-3 и Омега-6 мастни киселини.",
  },
  {
    name: "Purina Pro Plan Sterilised 3 кг",
    category: "Суха храна за котки",
    brand: "Purina Pro Plan",
    bgn: 68,
    oldBgn: 79,
    stock: 14,
    short: "За кастрирани котки — с контрол на теглото и грижа за уринарния тракт.",
    description:
      "След кастрация енергийните нужди на котката намаляват с до 30%. Тази формула поддържа идеалното тегло и подпомага здравето на уринарната система.",
    featured: true,
  },
  {
    name: "Whiskas пауч за котки говеждо в сос 100 г",
    category: "Консерви и пауч за котки",
    brand: "Whiskas",
    bgn: 1.6,
    stock: 240,
    short: "Пълноценна мокра храна на порционен пауч.",
    description:
      "Сочни парченца говеждо месо в сос. Пълноценна храна, подходяща за ежедневно хранене на възрастни котки.\n\nПрепоръчителна дневна дажба: 3–4 пауча за котка с тегло 4 кг.",
  },
  {
    name: "Мяу! пауч за котки с риба 100 г",
    category: "Консерви и пауч за котки",
    bgn: 1.2,
    stock: 300,
    short: "Българска мокра храна на достъпна цена.",
    description:
      "Пауч с парченца риба в желе. Подходящ като самостоятелно хранене или като допълнение към суха храна.",
  },
  {
    name: "Brit Premium консерва за кучета с агнешко 800 г",
    category: "Консерви и пауч за кучета",
    brand: "Brit Premium",
    bgn: 6.4,
    stock: 60,
    short: "Мокра храна с високо съдържание на месо.",
    description:
      "Пълноценна консервирана храна с агнешко месо и карантия. Подходяща за кучета от всички породи.\n\nМоже да се дава самостоятелно или смесена със суха храна.",
  },
  {
    name: "Royal Canin Kitten — храна за котенца 2 кг",
    category: "Храна за котенца",
    brand: "Royal Canin",
    bgn: 52,
    stock: 10,
    short: "За котенца от 4 до 12 месеца, в периода на растеж.",
    description:
      "Осигурява високо енергийно съдържание за бързо растящите котенца, както и антиоксиданти за подпомагане на изграждащата се имунна система.\n\nЛесно смилаеми протеини за деликатната храносмилателна система на котето.",
  },
  {
    name: "Сушени телешки дробчета 100 г",
    category: "Лакомства за кучета",
    bgn: 8.9,
    stock: 45,
    short: "100% натурално лакомство без добавки — идеално за обучение.",
    description:
      "Дехидратирани телешки дробчета без добавена сол, захар или консерванти.\n\nСилният аромат ги прави изключително мотивиращи при дресировка. Малкият размер позволява да се дават често, без да се прехранва кучето.",
    featured: true,
  },
  {
    name: "Дъвчащ кокал от телешка кожа 12 см",
    category: "Кокали и дъвчащи",
    bgn: 3.5,
    stock: 80,
    short: "Естествено почистване на зъбите чрез дъвчене.",
    description:
      "Пресован кокал от естествена телешка кожа. Продължителното дъвчене механично почиства зъбния камък и облекчава нуждата от дъвчене при млади кучета.\n\nПодходящ за кучета над 10 кг. Давайте под наблюдение.",
  },
  {
    name: "Лакомство за котки — пръчици с пиле 50 г",
    category: "Лакомства за котки",
    brand: "Trixie",
    bgn: 4.2,
    stock: 70,
    short: "Меки пръчици, подходящи за награда и за игра.",
    description:
      "Меки лакомства с високо съдържание на пилешко месо. Могат да се разчупят на по-малки парчета.",
  },
  {
    name: "Усилен нашийник от естествена кожа с двойна катарама",
    category: "Нашийници от естествена кожа",
    brand: "Uzunov 90",
    bgn: 42,
    stock: 15,
    short: "Ръчна изработка от българска телешка кожа — за едри и силни породи.",
    description:
      "Нашийник от естествена телешка кожа с дебелина 4 мм, изработен на ръка в нашата работилница във Варна.\n\nДвойната катарама разпределя натоварването и прави нашийника подходящ за едри и силни породи. Обковът е от неръждаема стомана.\n\nПоддръжка: почиствайте с влажна кърпа и обработвайте периодично с безцветен крем за кожа.\n\nИзмерване: измерете обиколката на врата и добавете 3–5 см.",
    featured: true,
    variants: [
      { label: "45 см", price: eur(38), stock: 5 },
      { label: "55 см", price: eur(42), stock: 6 },
      { label: "65 см", price: eur(46), stock: 4 },
    ],
  },
  {
    name: "Кожен нашийник с подплата — среден размер",
    category: "Нашийници от естествена кожа",
    brand: "Uzunov 90",
    bgn: 32,
    stock: 20,
    short: "Мека подплата, която не убива на врата при дълга разходка.",
    description:
      "Нашийник от естествена кожа с вътрешна мека подплата — предпазва козината и кожата на врата при кучета, които дърпат.\n\nПодходящ за породи със средно телосложение.",
  },
  {
    name: "Кожен повод за разходка 120 см",
    category: "Поводи",
    brand: "Uzunov 90",
    bgn: 38,
    stock: 18,
    short: "Класически повод от телешка кожа с усилен карабинер.",
    description:
      "Повод с дължина 120 см от естествена телешка кожа с двойни шевове.\n\nКарабинерът е от неръждаема стомана с въртящ се механизъм, който предотвратява усукването.",
    featured: true,
  },
  {
    name: "Повод за ловни кучета 5 м",
    category: "Поводи",
    brand: "Uzunov 90",
    bgn: 54,
    stock: 7,
    short: "Дълъг кожен повод за обучение и работа на открито.",
    description:
      "Дълъг повод от мека естествена кожа, предназначен за обучение, следови работи и разходки на открито пространство.\n\nДължина 5 м, с усилен карабинер.",
  },
  {
    name: "Комфортен намордник — размер M",
    category: "Намордници",
    brand: "Uzunov 90",
    bgn: 28,
    stock: 12,
    short: "Позволява на кучето да диша свободно и да пие вода.",
    description:
      "Намордник от естествена кожа с ергономична форма, която оставя достатъчно пространство за свободно дишане, дишане с изплезен език и пиене на вода.\n\nРегулируема каишка зад главата.\n\nИзмерване: измерете обиколката на муцуната на 2 см под очите.",
    variants: [
      { label: "S", price: eur(24), stock: 4 },
      { label: "M", price: eur(28), stock: 5 },
      { label: "L", price: eur(34), stock: 3 },
    ],
  },
  {
    name: "Автоматичен повод 5 м до 25 кг",
    category: "Хамути и автоматични повода",
    brand: "Trixie",
    bgn: 32,
    oldBgn: 39,
    stock: 22,
    short: "Прибиращ се повод с ергономична дръжка и спирачка.",
    description:
      "Автоматичен повод с лента, подходящ за кучета до 25 кг.\n\nЕдноръчно управление със спирачка и фиксатор. Дължина 5 м.",
  },
  {
    name: "Гребен за котки с въртящи се зъбци",
    category: "Гребени и четки",
    brand: "Trixie",
    bgn: 14.5,
    stock: 30,
    short: "Разресва без дърпане и намалява космените топки.",
    description:
      "Гребен с въртящи се метални зъбци, които се плъзгат през козината, без да я дърпат.\n\nРедовното разресване намалява количеството погълнати косми и съответно образуването на космени топки.",
    isNew: true,
  },
  {
    name: "Шампоан за кучета против косопад 250 мл",
    category: "Шампоани и парфюми",
    brand: "Beaphar",
    bgn: 12.9,
    stock: 35,
    short: "Подхранващ шампоан с провитамин B5.",
    description:
      "Шампоан за кучета с изтъняваща или падаща козина. Провитамин B5 подхранва космения фоликул, а нежната формула не изсушава кожата.\n\nУпотреба: намокрете козината, нанесете, масажирайте и изплакнете обилно. Може да се използва веднъж на 2 седмици.",
  },
  {
    name: "Хипоалергенен шампоан за чувствителна кожа 200 мл",
    category: "Шампоани и парфюми",
    brand: "Beaphar",
    bgn: 15.5,
    stock: 24,
    short: "Без сулфати и парфюм — за кучета с алергии и дразнения.",
    description:
      "Деликатна формула без сулфати, оцветители и парфюм. Подходяща за кучета с атопичен дерматит и склонност към раздразнения.\n\nСъдържа алое вера и овесен екстракт за успокояване на кожата.",
  },
  {
    name: "Хигиенни подложки за кучета 60×60 см, 50 бр.",
    category: "Пелени и подложки",
    bgn: 24,
    stock: 40,
    short: "Силно абсорбиращи подложки за обучение и за възрастни кучета.",
    description:
      "Петслойни подложки с гел-абсорбент, който заключва течността и неутрализира миризмата.\n\nПодходящи за обучение на кученца, за възрастни кучета и след операция.\n\nОпаковка: 50 броя.",
    featured: true,
  },
  {
    name: "Котешка тоалетна със сито и лопатка",
    category: "Тоалетни и постелки",
    brand: "Trixie",
    bgn: 26,
    stock: 16,
    short: "Висок борд, който задържа постелката вътре.",
    description:
      "Тоалетна с повдигнат борд, който предотвратява разпиляването на постелката.\n\nВ комплекта е включена лопатка. Размери: 50×40×15 см.",
  },
  {
    name: "Драскало-стълб с площадка 60 см",
    category: "Драскала",
    bgn: 58,
    oldBgn: 69,
    stock: 8,
    short: "Пази мебелите и дава на котката място за катерене.",
    description:
      "Стълб с покритие от естествено сизалово въже и площадка от плюш на върха.\n\nСтабилна основа, която издържа на скок от възрастна котка. Височина 60 см.",
  },
  {
    name: "Гумена играчка-кокал за дъвчене",
    category: "Играчки за кучета",
    brand: "Trixie",
    bgn: 9.9,
    stock: 50,
    short: "Издръжлива гума за кучета, които унищожават играчките.",
    description:
      "Играчка от плътна естествена гума, подходяща за силни дъвкачи.\n\nМасажира венците при дъвчене. Може да се напълни с лакомство, за да задържи вниманието на кучето по-дълго.",
  },
  {
    name: "Въдица за котки с пера",
    category: "Играчки за котки",
    bgn: 6.5,
    stock: 65,
    short: "Класическата играчка, която активира ловния инстинкт.",
    description:
      "Пръчка с еластичен шнур и пера в края. Идеална за ежедневна активна игра — поддържа котката във форма и намалява отегчението.",
    isNew: true,
  },
  {
    name: "Топка за лакомства за кучета",
    category: "Играчки за кучета",
    bgn: 12,
    stock: 28,
    short: "Забавя храненето и ангажира кучето за дълго.",
    description:
      "Топка с регулируем отвор, от който лакомствата излизат по време на търкаляне.\n\nПодходяща за кучета, които се отегчават сами вкъщи. Разглобява се за почистване.",
  },
  {
    name: "Зимно яке за кучета с подплата — размер M",
    category: "Дрехи за кучета",
    bgn: 34,
    stock: 14,
    short: "Водоотблъскващо яке с топла вътрешна подплата.",
    description:
      "Зимно яке с водоотблъскваща външна материя и мека подплата.\n\nОтвор за повод на гърба, регулируеми ленти на корема. Подходящо за кучета с къса козина.",
    variants: [
      { label: "S", price: eur(29), stock: 5 },
      { label: "M", price: eur(34), stock: 6 },
      { label: "L", price: eur(39), stock: 3 },
    ],
  },
  {
    name: "Дъждобран за кучета с качулка",
    category: "Дрехи за кучета",
    bgn: 26,
    stock: 18,
    short: "Лек и компактен — побира се в джоба.",
    description:
      "Дъждобран от лека водонепромокаема материя със сваляща се качулка.\n\nСгъва се компактно и се носи лесно в чанта при разходка.",
  },
  {
    name: "Купичка от неръждаема стомана 0,9 л",
    category: "Купички за котки",
    bgn: 11.5,
    stock: 42,
    short: "Хигиенична, не се надрасква и издържа години.",
    description:
      "Купичка от неръждаема стомана с гумен пръстен на дъното, който не позволява плъзгане по пода.\n\nПодходяща за миялна машина. За разлика от пластмасовите купички не задържа бактерии в надрасквания.",
  },
];

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
          icon: child.icon,
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
  let count = 0;

  for (const seed of PRODUCTS) {
    const slug = slugify(seed.name);

    const data = {
      name: seed.name,
      shortDescription: seed.short,
      description: seed.description,
      price: eur(seed.bgn),
      oldPrice: seed.oldBgn ? eur(seed.oldBgn) : null,
      stock: seed.stock,
      categoryId: categoryIdByName.get(seed.category) ?? null,
      brandId: seed.brand ? (brandIdByName.get(seed.brand) ?? null) : null,
      isFeatured: seed.featured ?? false,
      isNew: seed.isNew ?? false,
      isActive: true,
      variants: JSON.stringify(seed.variants ?? []),
    };

    await prisma.product.upsert({
      where: { slug },
      update: data,
      create: { ...data, slug, images: "[]" },
    });
    count += 1;
  }
  console.log(`✔ Продукти: ${count}`);

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
      slug: slugify("Brit Care Adult Medium Lamb & Rice 12 кг"),
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
      slug: slugify("Хигиенни подложки за кучета 60×60 см, 50 бр."),
      authorName: "Десислава М.",
      rating: 4,
      title: "Добро съотношение цена–качество",
      body: "Използвам ги за възрастното ми куче. Поемат добре и не миришат. Единствената забележка е, че биха могли да са малко по-големи.",
    },
    {
      slug: slugify("Кожен повод за разходка 120 см"),
      authorName: "Николай С.",
      rating: 5,
      title: "Приятен на допир и издръжлив",
      body: "Кожата омеква с времето и ляга добре в ръката. Карабинерът се върти и поводът не се усуква. Много по-добър от найлоновите.",
    },
  ];

  for (const seed of reviewSeeds) {
    const product = await prisma.product.findUnique({
      where: { slug: seed.slug },
      select: { id: true },
    });
    if (!product) continue;

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
