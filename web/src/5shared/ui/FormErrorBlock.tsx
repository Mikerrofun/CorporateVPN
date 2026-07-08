"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircleIcon } from "./icons/AlertCircleIcon";

const AUTO_HIDE_MS = 2000;

interface FormErrorBlockProps {
  messages: string[];
  /** Меняется на каждый сабмит, чтобы блок показывался заново даже с теми же ошибками */
  resetKey?: number;
}

export function FormErrorBlock({ messages, resetKey = 0 }: FormErrorBlockProps) {
  const messageKey = messages.join(",");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), AUTO_HIDE_MS);

    return () => clearTimeout(timer);
  }, [messageKey, messages.length, resetKey]);

  return (
    <AnimatePresence initial={false} mode="wait">
      {isVisible && messages.length > 0 && (
        <motion.div
          key={messageKey}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 top-0 z-10 w-full p-3"
          role="alert"
        >
          <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-bad/20 bg-panel/95 p-4 shadow-lg shadow-black/40 backdrop-blur-xl">
            <AlertCircleIcon className="h-5 w-5 shrink-0 text-bad" />
            <div className="flex flex-col gap-0.5">
              {messages.map((message) => (
                <span key={message} className="text-sm tracking-wide text-bad">
                  {message}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
