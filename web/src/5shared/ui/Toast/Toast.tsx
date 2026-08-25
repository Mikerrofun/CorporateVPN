"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import { XCircleIcon } from "../icons/XCircleIcon";
import type { ToastProps } from "./Toast.types";

const AUTO_HIDE_MS = 2000;

export function Toast({ id, message, variant, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const isSuccess = variant === "success";
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;
  const colorClasses = isSuccess
    ? "border-green-500/20 bg-green-500/10 text-green-400"
    : "border-bad/20 bg-bad/10 text-bad";

  return (
    <motion.button
      type="button"
      onClick={() => onClose(id)}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl border ${colorClasses} px-4 py-3 shadow-lg shadow-black/40 backdrop-blur-xl cursor-pointer hover:opacity-90 transition-opacity`}
      role="alert"
      aria-label="Закрыть уведомление"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="text-sm tracking-wide">{message}</span>
    </motion.button>
  );
}
