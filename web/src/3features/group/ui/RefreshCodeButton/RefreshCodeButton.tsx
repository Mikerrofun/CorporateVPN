"use client";

import { ConfirmDialog } from "@/5shared/ui";
import { useGroupActions } from "../../model/useGroupActions";
import type { RefreshCodeButtonProps } from "./RefreshCodeButton.types";

/**
 * Квадратная кнопка-иконка рядом с кодом группы: генерирует новый
 * groupCode для регистрации. Старый код перестаёт работать для новых
 * заходов, уже зарегистрированных участников это не затрагивает.
 */
export function RefreshCodeButton({ groupId }: RefreshCodeButtonProps) {
  const { isPending, runAction } = useGroupActions(groupId);
  const busy = isPending === "refresh-code";

  return (
    <ConfirmDialog
      trigger={
        <button
          type="button"
          disabled={busy}
          aria-label="Обновить код группы"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className={busy ? "animate-spin" : undefined}
          >
            <path
              d="M13.5 8a5.5 5.5 0 1 1-1.6-3.89M13.5 2v3.5H10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      }
      title="Обновить код группы?"
      description="Старый код перестанет работать для новых регистраций. Уже зарегистрированных участников это не затронет."
      confirmLabel="Обновить"
      onConfirm={async () => {
        await runAction("refresh-code");
      }}
    />
  );
}
