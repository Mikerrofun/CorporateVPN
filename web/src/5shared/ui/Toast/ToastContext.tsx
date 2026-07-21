"use client";

import { createContext, useState, useCallback, type ReactNode } from "react";
import type { ToastType, ToastContextValue, ToastVariant } from "./Toast.types";

export const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Минимальный Provider для Toast-уведомлений.
 * Хранит массив toasts и предоставляет методы управления.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, variant: ToastVariant) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const showSuccess = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );

  const showError = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, showSuccess, showError, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}
