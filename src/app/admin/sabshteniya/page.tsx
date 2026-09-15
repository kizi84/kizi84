import { Mail, MailOpen, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { deleteMessage, markMessageRead } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Съобщения" };

export default async function AdminMessagesPage() {
  const [messages, subscribers] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.subscriber.count(),
  ]);

  return (
    <>
      <PageHeader
        title="Съобщения"
        description={`${messages.length} запитвания · ${subscribers} абоната за бюлетин`}
      />

      {messages.length === 0 ? (
        <Card className="p-14 text-center text-sm text-ink-400">Няма получени съобщения.</Card>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li key={message.id}>
              <Card className={message.isRead ? "p-5" : "border-brand-200 bg-brand-50/40 p-5"}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-display font-bold text-ink-900">{message.name}</span>
                      {!message.isRead && <Badge className="bg-brand-100 text-brand-700">Ново</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      <a href={`mailto:${message.email}`} className="hover:text-brand-700">{message.email}</a>
                      {message.phone && (
                        <> · <a href={`tel:${message.phone}`} className="hover:text-brand-700">{message.phone}</a></>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-ink-400">{formatDate(message.createdAt)}</span>
                </div>

                {message.subject && (
                  <p className="mt-3 font-display font-bold text-ink-900">{message.subject}</p>
                )}
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-700">
                  {message.body}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                  <form action={markMessageRead}>
                    <input type="hidden" name="id" value={message.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                    >
                      {message.isRead
                        ? <><Mail className="size-4" aria-hidden /> Отбележи като ново</>
                        : <><MailOpen className="size-4" aria-hidden /> Отбележи като прочетено</>}
                    </button>
                  </form>

                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "Вашето запитване"}`)}`}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Отговори
                  </a>

                  <form action={deleteMessage} className="ml-auto">
                    <input type="hidden" name="id" value={message.id} />
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
          ))}
        </ul>
      )}
    </>
  );
}
