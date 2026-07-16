"use client";

import { useState } from "react";

/**
 * Shared hook для управления pending-состоянием при асинхронных действиях.
 * Используется в GroupActions, MembersTable, InviteManager для устранения дублирования.
 * 
 * @template T — тип ключа (string | number | enum)
 * @returns pendingKey (текущее pending-действие), execute (метод запуска)
 */
export function usePendingAction<T extends string | number = string>() {
  const [pendingKey, setPendingKey] = useState<T | null>(null);

  async function execute(key: T, action: () => Promise<void>) {
    setPendingKey(key);
    try {
      await action();
    } finally {
      setPendingKey(null);
    }
  }

  return { pendingKey, execute };
}
