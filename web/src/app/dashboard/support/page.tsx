import { requireEmployeeSession } from "@/5shared/session/guards";
import { prisma } from "@/5shared/api/prisma";

const TOPIC_LABELS: Record<string, string> = {
  CONNECTION: "Подключение",
  SPEED: "Скорость",
  ACCOUNT: "Аккаунт",
  OTHER: "Другое",
};

export default async function SupportPage() {
  const session = await requireEmployeeSession();

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      {/* TODO: SupportForm (Server Action createTicket) */}
      <div className="card border border-dashed border-white/[0.08]">
        <p className="text-sm text-slate-500">Форма обращения — в разработке</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">Мои обращения</h2>
        {tickets.length === 0 && <p className="text-sm text-slate-400">Обращений пока нет</p>}
        <ul className="divide-y divide-white/[0.05]">
          {tickets.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-200">{TOPIC_LABELS[t.topic] ?? t.topic}</p>
                <p className="text-slate-400">{t.message.slice(0, 80)}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs ${
                t.status === "OPEN" ? "bg-yellow-400/10 text-yellow-300" : "bg-emerald-500/10 text-emerald-400"
              }`}>
                {t.status === "OPEN" ? "Открыто" : "Закрыто"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
