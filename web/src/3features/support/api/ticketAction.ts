"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { ErrorCode } from "@/5shared/lib/errors";
import type { ActionResult } from "@/3features/group/model/types";

const schema = z.object({
  action: z.enum(["close", "reopen"]),
});

export async function ticketAction(
  ticketId: string,
  input: { action: "close" | "reopen" },
): Promise<ActionResult> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errorCode: ErrorCode.VALIDATION_ERROR };

  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false, errorCode: ErrorCode.TICKET_NOT_FOUND };

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { status: parsed.data.action === "close" ? "CLOSED" : "OPEN" },
  });

  revalidatePath("/admin/support");
  return { ok: true };
}
