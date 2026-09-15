import Link from "next/link";
import { Check, Star, Trash2, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { deleteReview, setReviewStatus } from "@/app/admin/actions";
import { REVIEW_STATUSES, reviewStatusMeta } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Отзиви" };

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "pending";

  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where: status === "all" ? {} : { status },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { product: { select: { name: true, slug: true } } },
    }),
    prisma.review.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const countFor = (value: string) =>
    counts.find((c) => c.status === value)?._count.status ?? 0;

  return (
    <>
      <PageHeader
        title="Отзиви"
        description="Одобрете отзивите, преди да се покажат в сайта."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {[...REVIEW_STATUSES, { value: "all", label: "Всички", color: "" }].map((item) => (
          <Link
            key={item.value}
            href={`/admin/otzivi?status=${item.value}`}
            className={
              status === item.value
                ? "rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white"
                : "rounded-full border border-ink-200 bg-white px-4 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50"
            }
          >
            {item.label}
            {item.value !== "all" && ` (${countFor(item.value)})`}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <Card className="p-14 text-center text-sm text-ink-400">
          Няма отзиви в тази категория.
        </Card>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const meta = reviewStatusMeta(review.status);
            return (
              <li key={review.id}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-display font-bold text-ink-900">{review.authorName}</span>
                        <div className="flex" aria-label={`Оценка ${review.rating} от 5`}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              aria-hidden
                              className={cn(
                                "size-3.5",
                                n <= review.rating
                                  ? "fill-amber-brand-400 text-amber-brand-400"
                                  : "text-ink-200",
                              )}
                            />
                          ))}
                        </div>
                        <Badge className={meta.color}>{meta.label}</Badge>
                      </div>

                      <Link
                        href={`/produkt/${review.product.slug}`}
                        target="_blank"
                        className="link-underline mt-1 inline-block text-xs text-ink-500 hover:text-brand-700"
                      >
                        {review.product.name}
                      </Link>
                    </div>

                    <span className="text-xs text-ink-400">{formatDate(review.createdAt)}</span>
                  </div>

                  {review.title && (
                    <p className="mt-3 font-display font-bold text-ink-900">{review.title}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-700">
                    {review.body}
                  </p>
                  {review.email && (
                    <p className="mt-2 text-xs text-ink-400">Имейл: {review.email}</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                    {review.status !== "approved" && (
                      <StatusButton
                        id={review.id}
                        status="approved"
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Check className="size-4" aria-hidden /> Одобри
                      </StatusButton>
                    )}
                    {review.status !== "rejected" && (
                      <StatusButton
                        id={review.id}
                        status="rejected"
                        className="border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
                      >
                        <X className="size-4" aria-hidden /> Отхвърли
                      </StatusButton>
                    )}
                    {review.status !== "pending" && (
                      <StatusButton
                        id={review.id}
                        status="pending"
                        className="border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
                      >
                        Върни за преглед
                      </StatusButton>
                    )}

                    <form action={deleteReview} className="ml-auto">
                      <input type="hidden" name="id" value={review.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="size-4" aria-hidden /> Изтрий
                      </button>
                    </form>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function StatusButton({
  id, status, className, children,
}: {
  id: string; status: string; className: string; children: React.ReactNode;
}) {
  return (
    <form action={setReviewStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors", className)}
      >
        {children}
      </button>
    </form>
  );
}
