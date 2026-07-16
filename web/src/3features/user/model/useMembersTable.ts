"use client";

import { usePendingAction } from "@/5shared/lib/hooks";
import { userAction } from "../api/userAction";

type UserActionType = "ban" | "unban" | "delete";

/**
 * Бизнес-логика действий над участниками.
 * Используется в MembersTable.tsx.
 */
export function useMembersTable() {
  const { pendingKey: pendingUserId, execute } = usePendingAction<string>();

  async function runAction(userId: string, action: UserActionType) {
    await execute(userId, async () => {
      await userAction(userId, { action });
      // router.refresh() не нужен — revalidatePath из server action обновляет UI
    });
  }

  return { pendingUserId, runAction };
}
