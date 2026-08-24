"use client";

import { useState } from "react";

import { usePendingAction } from "@/5shared/lib/hooks";
import { useToast } from "@/5shared/ui";
import { getErrorMessage } from "@/5shared/lib/errors";
import { groupAction } from "../api/groupAction";
import type { GroupActionResult, GroupActionType } from "../api/groupAction.types";
import type { GroupAction } from "./schemas";

export function useGroupActions(groupId: string) {
  const { pendingKey: isPending, execute } = usePendingAction<GroupActionType>();
  const { showSuccess, showError } = useToast();
  const [newMaxMembers, setNewMaxMembers] = useState<number>(10);

  async function runAction(payload: GroupAction): Promise<GroupActionResult | undefined> {
    return await execute(payload.action, async () => {
      return await groupAction(groupId, payload);
    });
  }

  async function runActionWithToast(
    payload: GroupAction,
    onComplete?: () => void
  ): Promise<void> {
    const result = await runAction(payload);
    if (!result?.ok) {
      showError(getErrorMessage(result?.errorCode));
      onComplete?.();
      return;
    }
    showSuccess("Успешно");
    onComplete?.();
  }

  async function handleUpdateMaxMembers(onComplete?: () => void): Promise<void> {
    await runActionWithToast(
      { action: "update-max-members", maxMembers: newMaxMembers },
      onComplete
    );
  }

  return {
    isPending,
    runAction,
    runActionWithToast,
    newMaxMembers,
    setNewMaxMembers,
    handleUpdateMaxMembers,
  };
}
