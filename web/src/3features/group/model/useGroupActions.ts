"use client";

import { usePendingAction } from "@/5shared/lib/hooks";
import { useToast } from "@/5shared/ui";
import { getErrorMessage } from "@/5shared/lib/errors";
import { groupAction } from "../api/groupAction";
import type { GroupActionType, GroupActionResult } from "../api/groupAction.types";


/**
 * Бизнес-логика действий над группой.
 * Используется в GroupActions.tsx и RefreshCodeButton.tsx.
 */
export function useGroupActions(groupId: string) {
  const { pendingKey: isPending, execute } = usePendingAction<GroupActionType>();
  const { showSuccess, showError } = useToast();

  async function runAction(action: GroupActionType): Promise<GroupActionResult | undefined> {
    return await execute(action, async () => {
      return await groupAction(groupId, { action });
    });
  }

  /**
   * Выполняет действие над группой с автоматической обработкой результата через toast-уведомления.
   * При успехе показывает "Успешно", при ошибке — текст из getErrorMessage.
   * После завершения вызывает опциональный коллбэк onComplete (например, для закрытия диалога/меню).
   */
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

  return { isPending, runAction, runActionWithToast };
}
