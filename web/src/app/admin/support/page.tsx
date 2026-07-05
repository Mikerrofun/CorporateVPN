import { requireAdminSession } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { TicketRow } from "@/components/admin/TicketRow";

const TOPIC_LABELS: Record<string, string> = {
  CONNECTION: "Подключение",
  SPEED: "Скорость",
  ACCOUNT: "Аккаунт",
  OTHER: "Другое",
};

export default async function AdminSupportPage() {
  await requireAdminSession();
  const tickets = await prisma.supportTicket.findMany({
    include: { user: true, company: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div className="card">
      <h1 className="mb-3 text-lg font-semibold">Обращения сотрудников</h1>
      <ul className="divide-y divide-border">
        {tickets.map((t) => (
          <TicketRow
            key={t.id}
            id={t.id}
            email={`${t.user.email} · ${t.company.name}`}
            topicLabel={TOPIC_LABELS[t.topic] ?? t.topic}
            message={t.message}
            status={t.status}
            createdAt={t.createdAt.toLocaleString("ru-RU")}
          />
        ))}
        {tickets.length === 0 && <p className="py-4 text-sm text-slate-400">Обращений пока нет.</p>}
      </ul>
    </div>
  );
}
