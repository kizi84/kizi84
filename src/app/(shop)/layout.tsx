import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { getNavCategories } from "@/lib/queries";
import { SITE } from "@/lib/constants";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await getNavCategories();

  // Structured data helps Google show the shop's locations and search box.
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "PetStore",
    name: SITE.name,
    legalName: SITE.legalName,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    address: SITE.locations.map((loc) => ({
      "@type": "PostalAddress",
      streetAddress: loc.address,
      addressLocality: loc.city,
      addressCountry: "BG",
    })),
    openingHours: "Mo-Sa 09:30-19:00",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/tarsene?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <CartProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Към съдържанието
      </a>
      <Header categories={categories} />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
