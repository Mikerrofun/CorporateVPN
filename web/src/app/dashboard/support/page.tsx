import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SupportForm } from "@/components/SupportForm";

const TOPIC_LABELS: Record<string, string> = {
  CONNECTION: "Подключение",
  SPEED: "Скорость",
  ACCOUNT: "Аккаунт",
  OTHER: "Другое",
};

export default async function SupportPage() {
  const session = await getServerSession(authOptions);
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <SupportForm />

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">Мои обращения</h2>
        {tickets.length === 0 && <p className="text-sm text-slate-400">Обращений пока нет</p>}
        <ul className="divide-y divide-border">
          {tickets.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{TOPIC_LABELS[t.topic] ?? t.topic}</p>
                <p className="text-slate-400">{t.message.slice(0, 80)}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  t.status === "OPEN" ? "bg-yellow-400/10 text-yellow-300" : "bg-good/10 text-good"
                }`}
              >
                {t.status === "OPEN" ? "Открыто" : "Закрыто"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
