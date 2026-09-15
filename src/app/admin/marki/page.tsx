import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, Field, PageHeader, TextArea } from "@/components/admin/ui";
import { deleteBrand, saveBrandForm } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Марки" };

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const editId = typeof params.edit === "string" ? params.edit : "";
  const error = typeof params.error === "string" ? params.error : "";

  const [brands, editing] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    editId ? prisma.brand.findUnique({ where: { id: editId } }) : null,
  ]);

  return (
    <>
      <PageHeader title="Марки" description="Марките се показват като филтър в каталога." />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-ink-100 bg-cream text-xs tracking-wide text-ink-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Марка</th>
                  <th className="px-4 py-3 font-semibold">Продукти</th>
                  <th className="px-4 py-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-14 text-center text-sm text-ink-400">
                      Няма създадени марки.
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id} className="transition-colors hover:bg-cream">
                      <td className="px-4 py-3">
                        <span className="block text-sm font-semibold text-ink-900">{brand.name}</span>
                        <span className="block text-xs text-ink-400">/{brand.slug}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">{brand._count.products}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/admin/marki?edit=${brand.id}`}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                          >
                            Редактирай
                          </a>
                          <form action={deleteBrand}>
                            <input type="hidden" name="id" value={brand.id} />
                            <button
                              type="submit"
                              className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Изтрий ${brand.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 lg:sticky lg:top-6">
          <h2 className="font-display text-lg font-bold text-ink-900">
            {editing ? "Редакция на марка" : "Нова марка"}
          </h2>

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          )}

          <form action={saveBrandForm} className="mt-4 space-y-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Име *" name="name" required defaultValue={editing?.name} placeholder="напр. Brit Care" />
            <TextArea label="Описание" name="description" rows={4} defaultValue={editing?.description} />
            <Field label="URL адрес (slug)" name="slug" defaultValue={editing?.slug} placeholder="автоматично от името" />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {editing ? "Запази" : "Създай"}
              </button>
              {editing && (
                <a
                  href="/admin/marki"
                  className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                >
                  Откажи
                </a>
              )}
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
