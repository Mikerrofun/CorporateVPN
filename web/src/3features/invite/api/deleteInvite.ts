"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { ErrorCode } from "@/5shared/lib/errors";
import type { ActionResult } from "@/5shared/lib/types/action-result";

/**
 * Удаление неиспользованного инвайт-кода.
 * Если код уже использован, возвращает ошибку — удалять надо через таблицу участников.
 */
export async function deleteInvite(inviteId: string): Promise<ActionResult> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: {
      usedBy: { select: { id: true } },
      group: { select: { name: true } },
    },
  });
  if (!invite) return { ok: false, errorCode: ErrorCode.INVITE_NOT_FOUND };

  // Используется — нельзя удалить напрямую, только через userAction.
  if (invite.usedBy) {
    return { ok: false, errorCode: ErrorCode.INVITE_ALREADY_USED };
  }

  // Unused — просто удаляем.
  await prisma.invite.delete({ where: { id: invite.id } });

  await prisma.adminAuditLog
    .create({
      data: {
        adminLogin: process.env.ADMIN_LOGIN ?? "admin",
        action: "invite_delete",
        details: `group=${invite.group.name} code=${invite.code}`,
      },
    })
    .catch(() => null);

  revalidatePath("/admin");
  return { ok: true };
}
