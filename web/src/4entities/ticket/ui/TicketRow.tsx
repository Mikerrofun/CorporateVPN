"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TicketRow({
  id,
  email,
  topicLabel,
  message,
  status,
  createdAt,
}: {
  id: string;
  email: string;
  topicLabel: string;
  message: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/tickets/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: status === "OPEN" ? "close" : "reopen" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <li className="flex items-start justify-between gap-4 py-3 text-sm">
      <div>
        <p className="font-medium">
          {topicLabel} · <span className="text-slate-400">{email}</span>
        </p>
        <p className="mt-1 text-slate-300">{message}</p>
        <p className="mt-1 text-xs text-slate-500">{createdAt}</p>
      </div>
      <button className="btn-ghost shrink-0" disabled={loading} onClick={toggle}>
        {status === "OPEN" ? "Закрыть" : "Переоткрыть"}
      </button>
    </li>
  );
}
