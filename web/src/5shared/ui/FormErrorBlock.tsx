"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircleIcon } from "./icons/AlertCircleIcon";

interface FormErrorBlockProps {
  messages: string[];
}

export function FormErrorBlock({ messages }: FormErrorBlockProps) {
  const messageKey = messages.join(",");

  return (
    <AnimatePresence initial={false} mode="wait">
      {messages.length > 0 && (
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
