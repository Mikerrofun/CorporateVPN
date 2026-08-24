"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/5shared/ui";
import { useGroupActions } from "../../model/useGroupActions";
import type { GroupActionsProps } from "./GroupActions.types";

export function GroupActions({ groupId, status }: GroupActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    isPending,
    runActionWithToast,
    newMaxMembers,
    setNewMaxMembers,
    handleUpdateMaxMembers,
  } = useGroupActions(groupId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        disabled={isPending !== null}
        aria-label="Действия"
        className="rounded-lg px-2 py-1 text-lg leading-none text-slate-400 hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
      >
        ⋯
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-white/[0.08] bg-panel p-1 shadow-xl shadow-black/40">
            {status === "ACTIVE" ? (
              <ConfirmDialog
                trigger={
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                  >
                    Приостановить
                  </button>
                }
                title="Приостановить группу?"
                description="Все участники потеряют доступ к VPN до возобновления."
                confirmLabel="Приостановить"
                onConfirm={() => runActionWithToast({ action: "suspend" }, () => setMenuOpen(false))}
              />
            ) : (
              <button
                type="button"
                onClick={() => runActionWithToast({ action: "resume" }, () => setMenuOpen(false))}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
              >
                Возобновить
              </button>
            )}

            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                >
                  Ротировать ключи
                </button>
              }
              title="Ротировать ключи?"
              description="Каждому участнику будет выдан новый ключ подписки. Старые перестанут работать."
              confirmLabel="Ротировать"
              onConfirm={() => runActionWithToast({ action: "rotate" }, () => setMenuOpen(false))}
            />

            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-sm text-slate-300">Лимит:</span>
              <input
                type="number"
                min={1}
                max={15}
                value={newMaxMembers}
                onChange={(e) => setNewMaxMembers(Number(e.target.value))}
                className="w-14 rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                onClick={() => handleUpdateMaxMembers(() => setMenuOpen(false))}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={isPending === "update-max-members"}
              >
                Обновить
              </button>
            </div>

            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10"
                >
                  Удалить группу
                </button>
              }
              title="Удалить группу?"
              description="Группа и все её участники будут удалены. Действие необратимо."
              confirmLabel="Удалить"
              onConfirm={() => runActionWithToast({ action: "delete" }, () => setMenuOpen(false))}
            />
          </div>
        </>
      )}
    </div>
  );
}