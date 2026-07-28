"use client";

import { usePendingAction } from "@/5shared/lib/hooks";
import { useToast } from "@/5shared/ui";
import { getErrorMessage } from "@/5shared/lib/errors";
import { groupAction } from "../api/groupAction";
import type { GroupActionType, GroupActionResult } from "../api/groupAction.types";
import type { GroupAction } from "./schemas";

export function useGroupActions(groupId: string) {
  const { pendingKey: isPending, execute } = usePendingAction<GroupActionType | string>();
  const { showSuccess, showError } = useToast();

  async function runAction(action: GroupActionType): Promise<GroupActionResult | undefined> {
    return await execute(action, async () => {
      return await groupAction(groupId, { action } as GroupAction);
    });
  }

  async function runActionPayload(payload: GroupAction): Promise<GroupActionResult | undefined> {
    return await execute(payload.action, async () => {
      return await groupAction(groupId, payload);
    });
  }

  async function runActionWithToast(
    action: GroupActionType,
    onComplete?: () => void
  ): Promise<void> {
    const result = await runAction(action);
    if (!result?.ok) {
      showError(getErrorMessage(result?.errorCode));
      onComplete?.();
      return;
    }
    showSuccess("Успешно");
    onComplete?.();
  }

  async function runActionWithToastPayload(
    payload: GroupAction,
    onComplete?: () => void
  ): Promise<void> {
    const result = await runActionPayload(payload);
    if (!result?.ok) {
      showError(getErrorMessage(result?.errorCode));
      onComplete?.();
      return;
    }
    showSuccess("Успешно");
    onComplete?.();
  }

  return {
    isPending,
    runAction,
    runActionPayload,
    runActionWithToast,
    runActionWithToastPayload,
  };
}