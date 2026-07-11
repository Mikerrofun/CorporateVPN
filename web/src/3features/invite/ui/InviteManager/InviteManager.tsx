"use client";

import { useInviteManager } from "../../model/useInviteManager";

type InviteManagerProps = {
  groupId: string;
  maxMembers: number;
};

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InviteManager({ groupId, maxMembers }: InviteManagerProps) {
  const {
    invites,
    isOpen,
    toggleOpen,
    hasLoaded,
    isLoading,
    isGenerating,
    error,
    handleGenerate,
    handleCopy,
  } = useInviteManager(groupId);

  return (
    <div className="space-y-3 border-t border-white/[0.04] pt-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 disabled:opacity-50"
        >
          {isGenerating ? "Генерация…" : "Сгенерировать персональный код"}
        </button>
        {error && <span className="text-xs text-rose-400">{error}</span>}
      </div>

      <div>
        <button
          type="button"
          onClick={toggleOpen}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200"
        >
          <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
          Персональные коды{hasLoaded ? ` (${invites.length} из ${maxMembers})` : ""}
        </button>

        {/* Collapsible: плавное раскрытие через max-height */}
        <div
          className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[600px] mt-3" : "max-h-0"}`}
        >
          {isLoading && <p className="text-xs text-slate-500">Загрузка…</p>}

          {!isLoading && hasLoaded && invites.length === 0 && (
            <p className="text-xs text-slate-500">Персональных кодов пока нет.</p>
          )}

          {!isLoading && invites.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-2">Код</th>
                  <th className="pb-2">Статус</th>
                  <th className="pb-2">Дата</th>
                  <th className="pb-2">Кем</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {invites.map((invite) => (
                  <tr key={invite.id}>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(invite.code)}
                        title="Скопировать код"
                        className="rounded-md border border-border bg-black/30 px-2 py-1 font-mono text-xs text-slate-300 hover:bg-white/10"
                      >
                        {invite.code}
                      </button>
                    </td>
                    <td className="py-2">
                      {invite.usedAt ? (
                        <span className="text-xs font-semibold text-slate-400">✓ Использован</span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400">○ Свободен</span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-slate-400">{formatDate(invite.usedAt)}</td>
                    <td className="py-2 font-mono text-xs text-slate-300">
                      {invite.usedBy?.login ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
