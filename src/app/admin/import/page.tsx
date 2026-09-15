import { FileSpreadsheet, Info, TerminalSquare } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { ImportPanel } from "@/components/admin/ImportPanel";

export const metadata = { title: "Импорт на продукти" };

export default function AdminImportPage() {
  return (
    <>
      <PageHeader
        title="Импорт на продукти"
        description="Прехвърлете целия си каталог наведнъж — от CSV файл или от стария сайт."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <ImportPanel />

        <div className="space-y-5 lg:sticky lg:top-6">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
              <FileSpreadsheet className="size-5 text-brand-600" aria-hidden />
              CSV колони
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              Първият ред е заглавен. Задължителни са само <code className="rounded bg-cream px-1">name</code> и{" "}
              <code className="rounded bg-cream px-1">price</code>.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-ink-600">
              {[
                ["name", "име на продукта"],
                ["price", "цена (число)"],
                ["oldPrice", "стара цена при промоция"],
                ["currency", "EUR или BGN — BGN се превалутира"],
                ["sku", "код на продукта"],
                ["stock", "наличност"],
                ["category", "категория"],
                ["parentCategory", "основна категория"],
                ["brand", "марка"],
                ["shortDescription", "кратко описание"],
                ["description", "пълно описание"],
                ["images", "URL адреси, разделени с |"],
                ["legacyId", "ID от стария сайт"],
              ].map(([key, note]) => (
                <li key={key} className="flex gap-2">
                  <code className="shrink-0 rounded bg-cream px-1.5 py-0.5 font-semibold text-ink-800">{key}</code>
                  <span className="text-ink-500">{note}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
              <TerminalSquare className="size-5 text-brand-600" aria-hidden />
              Прехвърляне от uzunov90.com
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              В проекта има готов скрипт, който обхожда стария сайт и сваля всички продукти
              със снимки, цени и описания:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-ink-900 p-3.5 text-xs text-ink-200">
              <code>npm run import:legacy</code>
            </pre>
            <p className="mt-2 text-xs text-ink-500">
              Скриптът записва <code className="rounded bg-cream px-1">products.json</code>, който
              можете да поставите тук или да заредите директно в базата.
            </p>
          </Card>

          <Card className="border-amber-200 bg-amber-50 p-5">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-amber-900">
              <Info className="size-4" aria-hidden />
              Повторен импорт е безопасен
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-amber-800">
              Продуктите се разпознават по <code className="rounded bg-white/60 px-1">legacyId</code> или
              по URL адрес и се обновяват, вместо да се дублират.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
