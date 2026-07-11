"use client";

import { useState } from "react";

import { getErrorMessage } from "@/5shared/lib/errors";
import { createInvite, getInvites, type InviteInfo } from "../api";

export function useInviteManager(groupId: string) {
  const [invites, setInvites] = useState<InviteInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadInvites() {
    setIsLoading(true);
    try {
      const data = await getInvites(groupId);
      setInvites(data);
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }

  // Тоггл секции: при первом раскрытии подгружаем инвайты.
  async function toggleOpen() {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !hasLoaded) {
      await loadInvites();
    }
  }

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);
    try {
      const result = await createInvite(groupId);
      if (!result.ok) {
        setError(getErrorMessage(result.errorCode));
        return;
      }

      // Копируем сгенерированный код в буфер (best-effort).
      await navigator.clipboard.writeText(result.code).catch(() => null);

      await loadInvites();
      setIsOpen(true);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code).catch(() => null);
  }

  return {
    invites,
    isOpen,
    toggleOpen,
    hasLoaded,
    isLoading,
    isGenerating,
    error,
    handleGenerate,
    handleCopy,
  };
}
