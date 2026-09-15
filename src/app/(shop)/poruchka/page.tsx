import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { CheckoutForm } from "@/components/shop/CheckoutForm";

export const metadata: Metadata = {
  title: "Завършване на поръчка",
  description: "Финализирайте поръчката си в Uzunov 90 — доставка с куриер до офис или адрес.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ href: "/poruchka", label: "Поръчка" }]} />
      <h1 className="mt-5 mb-8 font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">
        Завършване на поръчка
      </h1>
      <CheckoutForm />
    </div>
  );
}
