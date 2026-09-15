import { Breadcrumbs } from "@/components/shop/Breadcrumbs";

export type LegalSection = { heading: string; paragraphs: string[] };

export function LegalPage({
  title,
  href,
  intro,
  sections,
  updatedAt,
}: {
  title: string;
  href: string;
  intro: string;
  sections: LegalSection[];
  updatedAt: string;
}) {
  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs items={[{ href, label: title }]} />

      <article className="mt-5 max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 lg:text-4xl">{title}</h1>
        <p className="mt-4 leading-relaxed text-ink-600">{intro}</p>

        <div className="mt-8 space-y-8">
          {sections.map((section, index) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-bold text-ink-900">
                {index + 1}. {section.heading}
              </h2>
              {section.paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="mt-3 text-sm leading-relaxed text-ink-600">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-ink-200 pt-5 text-xs text-ink-400">
          Последна актуализация: {updatedAt}
        </p>
      </article>
    </div>
  );
}
