"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

interface CustomDialogProps {
  /** Элемент-триггер открытия (кнопка) */
  trigger: ReactNode;
  /** Контролируемое состояние открытия */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Основной контент модалки */
  content: ReactNode;
  /** Нижний блок (кнопки действий) */
  footer?: ReactNode;
}

/**
 * Компактная модалка на Radix Dialog в стиле темы проекта.
 * Контролируемая: open/onOpenChange управляются снаружи.
 */
export function CustomDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  content,
  footer,
}: CustomDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.05] bg-panel p-6 shadow-xl shadow-black/40 focus:outline-none"
        >
          <Dialog.Title className="text-lg font-bold text-white">{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-1 text-sm text-slate-400">
              {description}
            </Dialog.Description>
          ) : null}

          <div className="mt-4">{content}</div>

          {footer ? <div className="mt-5">{footer}</div> : null}

          <Dialog.Close
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-500 transition-colors hover:text-slate-300"
            aria-label="Закрыть"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
