"use server";

import { prisma } from "@/5shared/api/prisma";
import { requireEmployeeSession } from "@/5shared/session/guards";
import { ErrorCode } from "@/5shared/lib/errors";
import type { ActionResult } from "@/3features/group/model/types";
import { createTicketSchema, type CreateTicketInput } from "../model/schemas";

export async function createTicket(input: CreateTicketInput): Promise<ActionResult> {
  const session = await requireEmployeeSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errorCode: ErrorCode.VALIDATION_ERROR, details: parsed.error.issues[0].message };
  }

  await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      groupId: session.user.groupId,
      topic: parsed.data.topic,
      message: parsed.data.message,
    },
  });

  return { ok: true };
}
