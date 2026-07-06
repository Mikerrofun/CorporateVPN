"use client";

import { useState } from "react";

export function CopyInline({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="max-w-full truncate rounded-md border border-border bg-black/30 px-2 py-1 font-mono text-xs hover:bg-white/10"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title={value}
    >
      {copied ? "Скопировано" : (label ?? value)}
    </button>
  );
}
