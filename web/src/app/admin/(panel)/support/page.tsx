import { getTickets } from "@/3features/support/api/getTickets";

const TOPIC_LABELS: Record<string, string> = {
  CONNECTION: "Подключение",
  SPEED: "Скорость",
  ACCOUNT: "Аккаунт",
  OTHER: "Другое",
};

export default async function AdminSupportPage() {
  const tickets = await getTickets();

  return (
    <div className="card space-y-4">
      <h1 className="text-lg font-bold text-white">Обращения сотрудников</h1>
      {tickets.length === 0 && (
        <p className="text-sm text-slate-400">Обращений пока нет.</p>
      )}
      <ul className="divide-y divide-white/[0.05]">
        {tickets.map((t) => (
          <li key={t.id} className="py-4 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <span className="font-mono text-slate-300">{t.user.login}</span>
                <span className="text-slate-500"> · группа: {t.group.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.status === "OPEN" ? "bg-yellow-400/10 text-yellow-300" : "bg-emerald-500/10 text-emerald-400"}`}>
                  {t.status === "OPEN" ? "Открыто" : "Закрыто"}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(t.createdAt).toLocaleString("ru-RU")}
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {TOPIC_LABELS[t.topic] ?? t.topic}
            </p>
            <p className="text-sm text-slate-300">{t.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
