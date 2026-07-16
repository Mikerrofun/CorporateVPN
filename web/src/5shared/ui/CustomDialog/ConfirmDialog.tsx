"use client";

import { useState, type ReactNode } from "react";

import { CustomDialog } from "./CustomDialog";

interface ConfirmDialogProps {
  /** Триггер открытия (кнопка/иконка) */
  trigger: ReactNode;
  title: string;
  description?: string;
  /** Подпись кнопки подтверждения */
  confirmLabel?: string;
  /** Действие подтверждения; диалог закрывается после завершения */
  onConfirm: () => void | Promise<void>;
}

/**
 * Переиспользуемый диалог подтверждения разрушительных действий
 * (удаление/бан). Управляет собственным open-состоянием и loading.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Подтвердить",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <CustomDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      description={description}
      content={null}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={busy}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      }
    />
  );
}
