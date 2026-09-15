import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: { default: "Администрация", template: "%s | Админ Uzunov 90" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // The login page lives under /admin but must render without the shell.
  if (!session) return <div className="min-h-screen bg-cream">{children}</div>;

  const [newOrders, pendingReviews, unreadMessages] = await Promise.all([
    prisma.order.count({ where: { status: "new" } }),
    prisma.review.count({ where: { status: "pending" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  return (
    <AdminShell
      user={{ name: session.name, email: session.email }}
      badges={{ orders: newOrders, reviews: pendingReviews, messages: unreadMessages }}
    >
      {children}
    </AdminShell>
  );
}
