"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/5shared/ui";
import { userAction } from "../../api/userAction";

type Member = {
  id: string;
  login: string;
  status: "ACTIVE" | "BANNED" | "DELETED";
};

type MembersTableProps = {
  members: Member[];
};

/**
 * Таблица участников группы с действиями: бан/разбан и удаление.
 * DELETED-участники сюда не попадают (фильтруются на сервере).
 */
export function MembersTable({ members }: MembersTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function run(userId: string, action: "ban" | "unban" | "delete") {
    setBusyId(userId);
    try {
      await userAction(userId, { action });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (members.length === 0) return null;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
          <th className="pb-2">Логин</th>
          <th className="pb-2">Статус</th>
          <th className="pb-2 text-right">Действия</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.03]">
        {members.map((u) => (
          <tr key={u.id}>
            <td className="py-2 font-mono text-slate-300">{u.login}</td>
            <td className="py-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  u.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}
              >
                {u.status === "ACTIVE" ? "Активен" : "Заблокирован"}
              </span>
            </td>
            <td className="py-2">
              <div className="flex justify-end gap-2">
                {u.status === "BANNED" ? (
                  <button
                    type="button"
                    onClick={() => run(u.id, "unban")}
                    disabled={busyId === u.id}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    Разбан
                  </button>
                ) : (
                  <ConfirmDialog
                    trigger={
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        Бан
                      </button>
                    }
                    title="Заблокировать сотрудника?"
                    description="Сотрудник временно потеряет доступ к VPN."
                    confirmLabel="Заблокировать"
                    onConfirm={() => run(u.id, "ban")}
                  />
                )}

                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      disabled={busyId === u.id}
                      title="Удалить"
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      Удалить
                    </button>
                  }
                  title="Удалить сотрудника?"
                  description="Сотрудник потеряет доступ к VPN. Слот в группе освободится."
                  confirmLabel="Удалить"
                  onConfirm={() => run(u.id, "delete")}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
