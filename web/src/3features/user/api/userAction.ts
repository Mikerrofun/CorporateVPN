"use server";

import { revalidatePath } from "next/cache";

import { setVpnStatus } from "@/5shared/api/backend-client";
import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { ErrorCode } from "@/5shared/lib/errors";
import type { ActionResult } from "@/3features/group/model/types";
import { userActionSchema, type UserAction } from "../model/schemas";

export async function userAction(userId: string, input: UserAction): Promise<ActionResult> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const parsed = userActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errorCode: ErrorCode.VALIDATION_ERROR };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, errorCode: ErrorCode.USER_NOT_FOUND };

  const audit = (action: string, details?: string) =>
    prisma.adminAuditLog
      .create({
        data: {
          adminLogin: process.env.ADMIN_LOGIN ?? "admin",
          action,
          targetUserId: user.id,
          details: details ?? `login=${user.login}`,
        },
      })
      .catch(() => null);

  switch (parsed.data.action) {
    case "ban": {
      // Сначала отключаем VPN в Marzban (индивидуальный аккаунт), потом БД.
      try {
        await setVpnStatus(user.marzbanUsername, "disabled");
      } catch {
        return { ok: false, errorCode: ErrorCode.VPN_BACKEND_UNAVAILABLE };
      }
      await prisma.user.update({ where: { id: user.id }, data: { status: "BANNED" } });
      await audit("user_ban");
      break;
    }
    case "unban": {
      try {
        await setVpnStatus(user.marzbanUsername, "active");
      } catch {
        return { ok: false, errorCode: ErrorCode.VPN_BACKEND_UNAVAILABLE };
      }
      await prisma.user.update({ where: { id: user.id }, data: { status: "ACTIVE" } });
      await audit("user_unban");
      break;
    }
    case "delete": {
      // Soft-delete: VPN отключаем best-effort, юзер помечается DELETED
      // (строка живёт в БД для спец-ошибки на входе, аккаунт Marzban не удаляем).
      await setVpnStatus(user.marzbanUsername, "disabled").catch(() => null);
      await prisma.user.update({ where: { id: user.id }, data: { status: "DELETED" } });
      await audit("user_delete");
      break;
    }

    case "move": {
      const targetGroup = await prisma.group.findUnique({
        where: { id: parsed.data.groupId },
        include: { _count: { select: { members: true } } },
      });
      if (!targetGroup) return { ok: false, errorCode: ErrorCode.GROUP_NOT_FOUND };
      if (targetGroup._count.members >= targetGroup.maxMembers) {
        return { ok: false, errorCode: ErrorCode.GROUP_FULL };
      }
      // VPN-аккаунт индивидуальный и переезжает вместе с сотрудником —
      // менять ничего не нужно, только групповую принадлежность.
      await prisma.user.update({
        where: { id: user.id },
        data: { groupId: parsed.data.groupId },
      });
      await audit("user_move", `from=${user.groupId} to=${parsed.data.groupId}`);
      break;
    }
  }

  revalidatePath("/admin");
  return { ok: true };
}
