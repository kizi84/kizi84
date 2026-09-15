import { CreditCard, Headset, PackageCheck, Truck } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const items = [
  { icon: Truck, title: "Бърза доставка", text: "Куриер до офис или адрес в цялата страна" },
  { icon: PackageCheck, title: "Безплатно над 51,13 €", text: "За пратки до 3 кг в цялата страна" },
  { icon: CreditCard, title: "Удобно плащане", text: "Наложен платеж или банков превод" },
  { icon: Headset, title: "Съвет от експерт", text: "Помагаме с избора на подходяща храна" },
];

export function TrustBar() {
  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
        {items.map((item, index) => (
          <Reveal key={item.title} delay={index * 70} className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <item.icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
