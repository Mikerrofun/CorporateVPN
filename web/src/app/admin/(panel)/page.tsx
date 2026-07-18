import { getGroups } from "@/3features/group/api/getGroups";
import { CreateGroupForm, GroupActions } from "@/3features/group";
import { InviteManager } from "@/3features/invite";
import { MembersTable } from "@/3features/user/ui/MembersTable/MembersTable";



export default async function AdminPage() {
  const groups = await getGroups();

  const totalMembers = groups.reduce((sum, g) => sum + g._count.members, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-2xl border border-white/[0.05] bg-panel/30 p-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Группы</h1>
        <p className="mt-1 text-sm text-slate-400">
          Управление VPN-группами сотрудников. Каждая группа получает отдельный Marzban-аккаунт.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="card bg-panel/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Групп</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{groups.length}</p>
        </div>
        <div className="card bg-panel/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Сотрудников</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{totalMembers}</p>
        </div>
      </div>

      <CreateGroupForm />

      {/* Groups list */}
      <section className="grid gap-6">
        {groups.map((group) => {

          const invMemberIds = new Set(
            group.invites.filter((inv) => inv.usedBy).map((inv) => inv.usedBy!.id)
          );
          const grpMembersCount = group.members.filter(
            (member) => !invMemberIds.has(member.id)
          ).length;

          return (
            <div key={group.id} className="card border border-white/[0.04] bg-panel/20 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{group.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {group._count.members} / {group.maxMembers} участников · код: <span className="font-mono text-slate-300">{group.groupCode}</span>
                  </p>
                  {group.status === "SUSPENDED" && (
                    <span className="mt-2 inline-block rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
                      Приостановлено
                    </span>
                  )}
                </div>
                <GroupActions groupId={group.id} status={group.status} />
              </div>

              {/* Members */}
              <MembersTable members={group.members} />

              <InviteManager 
                groupId={group.id} 
                maxMembers={group.maxMembers} 
                grpMembersCount={grpMembersCount}
                invites={group.invites} 
              />

            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/[0.08]">
            <p className="text-sm text-slate-400">Групп пока нет.</p>
          </div>
        )}
      </section>
    </div>
  );
}
