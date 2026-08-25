"use client";

import { useContext } from "react";
import { ToastContext } from "./ToastContext";
import type { ToastContextValue } from "./Toast.types";

/**
 * Hook для доступа к Toast-уведомлениям.
 * Должен использоваться внутри ToastProvider.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
