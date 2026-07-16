"use server";

import { revalidatePath } from "next/cache";

import { setVpnStatus } from "@/5shared/api/backend-client";
import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { ErrorCode } from "@/5shared/lib/errors";
import type { ActionResult } from "@/5shared/lib/types/action-result";

/**
 * - Неиспользованный код: просто удаляем строку invite.
 * - Использованный код: VPN отключаем best-effort, сотрудника помечаем
 *   DELETED и удаляем строку invite (атомарно). Аккаунт Marzban не удаляем.
 */
export async function deleteInvite(inviteId: string): Promise<ActionResult> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: {
      usedBy: { select: { id: true, login: true, marzbanUsername: true } },
      group: { select: { name: true } },
    },
  });
  if (!invite) return { ok: false, errorCode: ErrorCode.INVITE_NOT_FOUND };

  if (!invite.usedBy) {
    await prisma.invite.delete({ where: { id: invite.id } });
  } else {
    await setVpnStatus(invite.usedBy.marzbanUsername, "disabled").catch(() => null);
    await prisma.$transaction([
      prisma.user.update({ where: { id: invite.usedBy.id }, data: { status: "DELETED" } }),
      prisma.invite.delete({ where: { id: invite.id } }),
    ]);
  }

  await prisma.adminAuditLog
    .create({
      data: {
        adminLogin: process.env.ADMIN_LOGIN ?? "admin",
        action: "invite_delete",
        targetUserId: invite.usedBy?.id ?? null,
        details: `group=${invite.group.name} code=${invite.code}`,
      },
    })
    .catch(() => null);

  revalidatePath("/admin");
  return { ok: true };
}
