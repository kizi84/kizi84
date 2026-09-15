import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Card, Field, PageHeader, Select, TextArea, Toggle } from "@/components/admin/ui";
import { deleteCategory, saveCategoryForm } from "@/app/admin/actions";
import { getCategoryOptions } from "@/lib/admin-options";

export const dynamic = "force-dynamic";
export const metadata = { title: "Категории" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const editId = typeof params.edit === "string" ? params.edit : "";
  const error = typeof params.error === "string" ? params.error : "";

  const [categories, options, editing] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      include: {
        parent: { select: { name: true } },
        _count: { select: { products: true, children: true } },
      },
    }),
    getCategoryOptions(),
    editId ? prisma.category.findUnique({ where: { id: editId } }) : null,
  ]);

  // A category can't be its own parent.
  const parentOptions = options.filter((o) => o.value !== editId);

  return (
    <>
      <PageHeader
        title="Категории"
        description="Организирайте каталога. Категориите без родител се показват в главното меню."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-left">
              <thead className="border-b border-ink-100 bg-cream text-xs tracking-wide text-ink-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Категория</th>
                  <th className="px-4 py-3 font-semibold">Родител</th>
                  <th className="px-4 py-3 font-semibold">Продукти</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center text-sm text-ink-400">
                      Няма създадени категории.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="transition-colors hover:bg-cream">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                          {category.icon && <span aria-hidden>{category.icon}</span>}
                          {category.name}
                        </span>
                        <span className="block text-xs text-ink-400">/{category.slug}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">{category.parent?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-ink-600">
                        {category._count.products}
                        {category._count.children > 0 && (
                          <span className="text-ink-400"> · {category._count.children} подкат.</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={category.isActive ? "bg-emerald-100 text-emerald-700" : "bg-ink-200 text-ink-600"}>
                          {category.isActive ? "Активна" : "Скрита"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/admin/kategorii?edit=${category.id}`}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                          >
                            Редактирай
                          </a>
                          <form action={deleteCategory}>
                            <input type="hidden" name="id" value={category.id} />
                            <button
                              type="submit"
                              className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Изтрий ${category.name}`}
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
            {editing ? "Редакция на категория" : "Нова категория"}
          </h2>

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          )}

          <form action={saveCategoryForm} className="mt-4 space-y-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <Field label="Име *" name="name" required defaultValue={editing?.name} placeholder="напр. Храна за кучета" />
            <Field label="Икона (емоджи)" name="icon" defaultValue={editing?.icon} placeholder="🐕" />
            <Select
              label="Родителска категория"
              name="parentId"
              defaultValue={editing?.parentId}
              options={parentOptions}
              placeholder="— основна категория —"
            />
            <Field label="Подредба" name="position" type="number" defaultValue={editing?.position ?? 0} hint="По-малко число = по-напред." />
            <TextArea label="Описание" name="description" rows={3} defaultValue={editing?.description} />
            <Field label="URL адрес (slug)" name="slug" defaultValue={editing?.slug} placeholder="автоматично от името" />

            <div className="space-y-2.5">
              <Toggle label="Активна" name="isActive" defaultChecked={editing?.isActive ?? true} />
              <Toggle label="Показвай в менюто" name="showInMenu" defaultChecked={editing?.showInMenu ?? true} />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {editing ? "Запази" : "Създай"}
              </button>
              {editing && (
                <a
                  href="/admin/kategorii"
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
