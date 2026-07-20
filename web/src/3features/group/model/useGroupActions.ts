"use client";

import { usePendingAction } from "@/5shared/lib/hooks";
import { groupAction } from "../api/groupAction";
import type { GroupActionType, GroupActionResult } from "../api/groupAction.types";


/**
 * Бизнес-логика действий над группой.
 * Используется в GroupActions.tsx.
 */
export function useGroupActions(groupId: string) {
  const { pendingKey: isPending, execute } = usePendingAction<GroupActionType>();

  async function runAction(action: GroupActionType): Promise<GroupActionResult | undefined> {
    return await execute(action, async () => {
      return await groupAction(groupId, { action });
    });
  }

  return { isPending, runAction };
}
