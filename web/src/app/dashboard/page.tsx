import { requireEmployeeSession } from "@/5shared/session/guards";
import { prisma } from "@/5shared/api/prisma";

export default async function DashboardPage() {
  const session = await requireEmployeeSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    include: { group: true },
  });

  const isActive = user.group.status === "ACTIVE";

  return (
    <div className="space-y-6">
      <div className="card bg-panel/30 border border-white/[0.05]">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-white">Статус учётной записи</h1>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isActive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            {isActive ? "Активен" : "Приостановлен"}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-black/20 p-4 border border-white/[0.03]">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Группа</p>
            <p className="mt-1 text-base font-bold text-white">{user.group.name}</p>
          </div>
          <div className="rounded-xl bg-black/20 p-4 border border-white/[0.03]">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">VPN-доступ</p>
            <p className="mt-1 text-sm font-medium text-slate-300">
              {isActive ? "Предоставлен" : "Приостановлен администратором"}
            </p>
          </div>
        </div>
      </div>

      {/* TODO: ConnectPanel с subscriptionUrl из group */}
      {user.group.subscriptionUrl ? (
        <div className="card border border-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Ссылка подписки</p>
          <p className="font-mono text-sm text-slate-300 break-all">{user.group.subscriptionUrl}</p>
        </div>
      ) : (
        <div className="card border border-dashed border-white/[0.08]">
          <p className="text-sm text-slate-500">VPN-подписка ещё не выдана администратором.</p>
        </div>
      )}
    </div>
  );
}
