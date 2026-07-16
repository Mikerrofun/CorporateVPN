"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { usePendingAction } from "@/5shared/lib/hooks";
import { getErrorMessage } from "@/5shared/lib/errors";
import { createInvite, deleteInvite } from "../api";

/**
 * Бизнес-логика менеджера инвайт-кодов.
 * Убрана загрузка данных (invites приходят с сервера), оставлены только мутации.
 */
export function useInviteManager(groupId: string) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const { pendingKey: deletingId, execute } = usePendingAction<string>();
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);
    try {
      const result = await createInvite(groupId);
      if (!result.ok) {
        setError(getErrorMessage(result.errorCode));
        return;
      }
      await navigator.clipboard.writeText(result.code).catch(() => null);
      router.refresh();
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(inviteId: string) {
    setError(null);
    await execute(inviteId, async () => {
      const result = await deleteInvite(inviteId);
      if (!result.ok) {
        setError(getErrorMessage(result.errorCode));
        return;
      }
      router.refresh();
    });
  }

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code).catch(() => null);
  }

  return {
    isGenerating,
    deletingId,
    error,
    handleGenerate,
    handleCopy,
    handleDelete,
  };
}
