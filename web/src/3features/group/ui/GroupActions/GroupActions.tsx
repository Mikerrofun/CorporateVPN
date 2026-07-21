"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/5shared/ui";
import { useGroupActions } from "../../model/useGroupActions";
import type { GroupActionsProps } from "./GroupActions.types";

/**
 * Меню действий над группой («⋯»): приостановка/возобновление, ротация
 * ключей, удаление. Разрушительные действия подтверждаются через ConfirmDialog.
 * Поповер — простой useState-toggle без сторонних либ.
 */
export function GroupActions({ groupId, status }: GroupActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isPending, runActionWithToast } = useGroupActions(groupId);

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
          {/* клик вне меню закрывает */}
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
                onConfirm={() => runActionWithToast("suspend", () => setMenuOpen(false))}
              />
            ) : (
              <button
                type="button"
                onClick={() => runActionWithToast("resume", () => setMenuOpen(false))}
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
              onConfirm={() => runActionWithToast("rotate", () => setMenuOpen(false))}
            />

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
              onConfirm={() => runActionWithToast("delete", () => setMenuOpen(false))}
            />
          </div>
        </>
      )}
    </div>
  );
}
