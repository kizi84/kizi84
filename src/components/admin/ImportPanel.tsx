"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import { Card, Toggle } from "@/components/admin/ui";
import { parseCsv, type ImportRow } from "@/lib/csv";

type Result = {
  created: number;
  updated: number;
  deactivated: number;
  failed: number;
  failures: string[];
};

export function ImportPanel() {
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [parseError, setParseError] = useState("");
  const [deactivateMissing, setDeactivateMissing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function analyse(text: string) {
    setRaw(text);
    setResult(null);
    setError("");
    setParseError("");

    const trimmed = text.trim();
    if (!trimmed) {
      setRows(null);
      return;
    }

    try {
      // A JSON payload may be a bare array or { products: [...] } from the scraper.
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        const list = Array.isArray(parsed) ? parsed : parsed.products;
        if (!Array.isArray(list)) throw new Error("Очаква се масив от продукти");
        setRows(list as ImportRow[]);
      } else {
        setRows(parseCsv(trimmed));
      }
    } catch (err) {
      setRows(null);
      setParseError(err instanceof Error ? err.message : "Данните не можаха да бъдат разчетени");
    }
  }

  async function onFile(file: File) {
    const text = await file.text();
    analyse(text);
  }

  async function submit() {
    if (!rows || rows.length === 0) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: rows, deactivateMissing }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(payload.error ?? "Импортът се провали");
      } else {
        setResult(payload as Result);
        setRaw("");
        setRows(null);
      }
    } catch {
      setError("Няма връзка със сървъра");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {result && (
        <Card className="border-emerald-200 bg-emerald-50 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-emerald-900">
            <CheckCircle2 className="size-5" aria-hidden />
            Импортът приключи
          </h2>
          <ul className="mt-3 grid gap-2 text-sm text-emerald-800 sm:grid-cols-2">
            <li>Създадени: <strong>{result.created}</strong></li>
            <li>Обновени: <strong>{result.updated}</strong></li>
            {result.deactivated > 0 && <li>Деактивирани: <strong>{result.deactivated}</strong></li>}
            {result.failed > 0 && (
              <li className="text-rose-700">Неуспешни: <strong>{result.failed}</strong></li>
            )}
          </ul>
          {result.failures.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-emerald-900">
                Покажи грешките
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-rose-700">
                {result.failures.map((failure, index) => <li key={index}>{failure}</li>)}
              </ul>
            </details>
          )}
        </Card>
      )}

      <Card className="p-5 lg:p-6">
        <h2 className="font-display text-lg font-bold text-ink-900">1. Заредете данните</h2>
        <p className="mt-1 text-sm text-ink-500">
          Качете CSV или JSON файл, или поставете съдържанието му в полето по-долу.
        </p>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
        >
          <FileUp className="size-4" aria-hidden />
          Избери файл
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />

        <textarea
          value={raw}
          onChange={(e) => analyse(e.target.value)}
          rows={10}
          placeholder={"name,price,currency,category,brand,stock\nBrit Care Adult Medium Lamb & Rice 12кг,82,BGN,Суха храна за кучета,Brit,5"}
          className="mt-4 w-full rounded-xl border border-ink-200 bg-cream px-4 py-3 font-mono text-xs focus:border-brand-400 focus:outline-none"
        />

        {parseError && (
          <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{parseError}</p>
        )}
      </Card>

      {rows && rows.length > 0 && (
        <Card className="p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">
            2. Проверете — разчетени {rows.length} продукта
          </h2>

          <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-ink-100">
            <table className="w-full min-w-2xl text-left text-xs">
              <thead className="sticky top-0 bg-cream text-ink-500 uppercase">
                <tr>
                  <th className="px-3 py-2 font-semibold">Име</th>
                  <th className="px-3 py-2 font-semibold">Цена</th>
                  <th className="px-3 py-2 font-semibold">Категория</th>
                  <th className="px-3 py-2 font-semibold">Марка</th>
                  <th className="px-3 py-2 font-semibold">Снимки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.slice(0, 50).map((row, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-ink-800">{row.name}</td>
                    <td className="px-3 py-2 text-ink-600">
                      {row.price} {row.currency ?? "EUR"}
                    </td>
                    <td className="px-3 py-2 text-ink-600">{row.category ?? "—"}</td>
                    <td className="px-3 py-2 text-ink-600">{row.brand ?? "—"}</td>
                    <td className="px-3 py-2 text-ink-600">{row.images?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && (
            <p className="mt-2 text-xs text-ink-400">Показани са първите 50 реда.</p>
          )}

          <div className="mt-5">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 bg-cream p-3.5">
              <input
                type="checkbox"
                checked={deactivateMissing}
                onChange={(e) => setDeactivateMissing(e.target.checked)}
                className="mt-0.5 size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
              />
              <span>
                <span className="block text-sm font-semibold text-ink-800">
                  Скрий продуктите, които не са в този файл
                </span>
                <span className="block text-xs text-ink-400">
                  Полезно при пълна синхронизация на каталога. Продуктите не се изтриват, само се скриват.
                </span>
              </span>
            </label>
          </div>

          {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
            Импортирай {rows.length} продукта
          </button>
        </Card>
      )}
    </div>
  );
}
