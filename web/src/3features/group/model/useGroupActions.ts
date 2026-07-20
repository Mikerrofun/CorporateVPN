"use client";

import { usePendingAction } from "@/5shared/lib/hooks";
import { groupAction } from "../api/groupAction";
import type { GroupActionType } from "../api/groupAction.types";


/**
 * Бизнес-логика действий над группой.
 * Используется в GroupActions.tsx.
 */
export function useGroupActions(groupId: string) {
  const { pendingKey: isPending, execute } = usePendingAction<GroupActionType>();

  async function runAction(action: GroupActionType) {
    await execute(action, async () => {
      await groupAction(groupId, { action });
    });
  }

  return { isPending, runAction };
}
