export const SITE = {
  name: "Uzunov 90",
  legalName: "УЗУНОВ 90 АНИМАЛПЕТС ООД",
  tagline: "Храни и аксесоари за кучета и котки",
  description:
    "Зоомагазин Uzunov 90 — храни, лакомства, аксесоари, играчки и дрехи за кучета и котки. Първият български производител на кучешки аксесоари от естествена кожа. Доставка до цялата страна.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://uzunov90.com",
  phone: "+359 899 000 000",
  email: "office@uzunov90.com",
  locations: [
    {
      name: "Магазин Братя Миладинови",
      address: "ул. „Братя Миладинови“ 144",
      city: "Варна",
      hours: "Понеделник – Събота: 09:30 – 19:00",
    },
    {
      name: "Магазин 8-ми Приморски полк",
      address: "бул. „8-ми Приморски полк“ 202",
      city: "Варна",
      hours: "Понеделник – Събота: 09:30 – 19:00",
    },
    {
      name: "Складова база",
      address: "с. Кичево",
      city: "обл. Варна",
      hours: "Понеделник – Петък: 09:00 – 17:00",
    },
  ],
  social: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
  },
} as const;

/** Free-shipping thresholds carried over from the current shop's delivery terms. */
export const SHIPPING = {
  varnaFreeOver: 25.56, // 50 лв.
  countryFreeOver: 51.13, // 100 лв.
  maxFreeWeightKg: 3,
  officeRate: 3.5,
  addressRate: 5.0,
} as const;

export const ORDER_STATUSES = [
  { value: "new", label: "Нова", color: "bg-blue-100 text-blue-700" },
  { value: "confirmed", label: "Потвърдена", color: "bg-amber-100 text-amber-700" },
  { value: "shipped", label: "Изпратена", color: "bg-violet-100 text-violet-700" },
  { value: "delivered", label: "Доставена", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "Отказана", color: "bg-rose-100 text-rose-700" },
] as const;

export const REVIEW_STATUSES = [
  { value: "pending", label: "Чака одобрение", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Одобрено", color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected", label: "Отхвърлено", color: "bg-rose-100 text-rose-700" },
] as const;

export const DELIVERY_METHODS = [
  { value: "speedy_office", label: "До офис на Speedy", rate: SHIPPING.officeRate },
  { value: "speedy_address", label: "До адрес", rate: SHIPPING.addressRate },
  { value: "pickup", label: "Вземане от магазин във Варна", rate: 0 },
] as const;

export const PAYMENT_METHODS = [
  { value: "cod", label: "Наложен платеж (при доставка)" },
  { value: "bank_transfer", label: "Банков превод" },
] as const;

export function statusMeta(value: string) {
  return ORDER_STATUSES.find((s) => s.value === value) ?? ORDER_STATUSES[0];
}

export function reviewStatusMeta(value: string) {
  return REVIEW_STATUSES.find((s) => s.value === value) ?? REVIEW_STATUSES[0];
}
