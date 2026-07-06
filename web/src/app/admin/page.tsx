import { requireAdminSession } from "@/5shared/session/guards";
import { backend } from "@/5shared/api/backend-client";
import { formatBytes, isRecentlyOnline } from "@/5shared/lib/format";
import { prisma } from "@/5shared/api/prisma";
import { CopyInline } from "@/5shared/ui/CopyInline";
import { StatusDot } from "@/5shared/ui/StatusDot";
import { CreateCompanyForm } from "@/3features/create-company/ui/CreateCompanyForm";
import { CreateEmployeeForm } from "@/3features/create-employee/ui/CreateEmployeeForm";
import { CompanyActions } from "@/4entities/company/ui/CompanyActions";
import { EmployeesTable } from "@/4entities/employee/ui/EmployeesTable";

async function usageFor(username: string | null) {
  if (!username) return null;
  try {
    return await backend.getUsage(username);
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const session = await requireAdminSession();

  const companies = await prisma.company.findMany({
    where: { isInternal: false },
    include: { users: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  const usageEntries = await Promise.all(
    companies.map(async (c) => [c.id, await usageFor(c.marzbanUsername)] as const),
  );
  const usageByCompany = new Map(usageEntries);

  const totalEmployees = companies.reduce((sum, c) => sum + c.users.length, 0);
  const totalTraffic = companies.reduce((sum, c) => sum + (usageByCompany.get(c.id)?.used_traffic ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Title & Info Section */}
      <section className="flex flex-col gap-4 rounded-2xl border border-white/[0.05] bg-panel/30 p-6 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-400">
              Платформа
            </span>
            <span className="text-xs text-slate-400">Панель администратора</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Корпорации</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 leading-relaxed">
            Управляйте корпоративными клиентами. Каждая корпорация получает отдельный код входа
            и общую VPN-подписку для всех своих сотрудников.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-400 md:text-right">
          <span className="text-xs text-slate-500 block">Вы вошли как</span>
          <span className="text-blue-300 font-mono">{session!.user.email}</span>
        </div>
      </section>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card bg-panel/40 hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <p className="label">Корпораций</p>
            <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{companies.length}</p>
        </div>
        <div className="card bg-panel/40 hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <p className="label">Сотрудников</p>
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{totalEmployees}</p>
        </div>
        <div className="card bg-panel/40 hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <p className="label">Суммарный трафик</p>
            <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{formatBytes(totalTraffic)}</p>
        </div>
      </div>

      <CreateCompanyForm />

      {/* Companies List */}
      <section className="grid gap-6">
        {companies.map((company) => {
          const usage = usageByCompany.get(company.id) ?? null;
          const employeeRows = company.users.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            status: u.status,
          }));
          const isOnline = isRecentlyOnline(usage?.online_at);

          return (
            <div key={company.id} className="card border border-white/[0.04] bg-panel/20 space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between border-b border-white/[0.04] pb-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-white">{company.name}</h2>
                    <div className="flex items-center gap-1.5 rounded-full bg-slate-800/40 px-2 py-0.5 border border-white/[0.03]">
                      <StatusDot online={isOnline} />
                      <span className="text-xs text-slate-400">
                        {isOnline ? "Онлайн" : "Офлайн"}
                      </span>
                    </div>
                    {company.status === "SUSPENDED" && (
                      <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
                        Приостановлено
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyInline value={company.code} />
                    {company.subscriptionUrl ? (
                      <CopyInline value={company.subscriptionUrl} label="Скопировать ссылку подписки" />
                    ) : (
                      <span className="inline-flex items-center rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
                        VPN-подписка не выпущена
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 self-stretch lg:self-auto">
                  <div className="grid grid-cols-2 gap-2 text-center text-sm w-full sm:w-auto">
                    <div className="rounded-xl border border-white/[0.05] bg-black/20 p-2.5">
                      <p className="text-lg font-bold text-white">{company.users.length}</p>
                      <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Сотрудники</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-black/20 p-2.5">
                      <p className="text-lg font-bold text-white">{formatBytes(usage?.used_traffic ?? 0)}</p>
                      <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Трафик</p>
                    </div>
                  </div>
                  <CompanyActions companyId={company.id} status={company.status} />
                </div>
              </div>

              {/* Employee section in company */}
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400">Сотрудники компании</h3>
                  <CreateEmployeeForm companyId={company.id} />
                </div>
                <EmployeesTable rows={employeeRows} />
              </div>
            </div>
          );
        })}
        {companies.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/[0.08] bg-panel/10">
            <p className="text-sm text-slate-400">Зарегистрированных корпораций пока нет.</p>
          </div>
        )}
      </section>
    </div>
  );
}
