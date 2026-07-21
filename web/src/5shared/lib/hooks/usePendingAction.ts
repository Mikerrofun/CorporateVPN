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

  async function execute<R>(key: T, action: () => Promise<R>): Promise<R | undefined> {
    setPendingKey(key);
    try {
      const result = await action();
      return result;
    } finally {
      setPendingKey(null);
    }
  }

  return { pendingKey, execute };
}
