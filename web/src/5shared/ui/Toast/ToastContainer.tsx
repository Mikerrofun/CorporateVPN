"use client";

import { AnimatePresence } from "framer-motion";
import { Toast } from "./Toast";
import { useToast } from "./useToast";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex flex-col items-center gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
