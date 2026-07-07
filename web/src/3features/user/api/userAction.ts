"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import type { ActionResult } from "@/3features/group/model/types";
import { userActionSchema, type UserAction } from "../model/schemas";

export async function userAction(userId: string, input: UserAction): Promise<ActionResult> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, error: "Unauthorized" };

  const parsed = userActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Некорректный запрос" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Сотрудник не найден" };

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
      await prisma.user.update({ where: { id: user.id }, data: { status: "BANNED" } });
      await audit("user_ban");
      break;
    }
    case "unban": {
      await prisma.user.update({ where: { id: user.id }, data: { status: "ACTIVE" } });
      await audit("user_unban");
      break;
    }
    case "delete": {
      await prisma.user.delete({ where: { id: user.id } });
      await audit("user_delete");
      break;
    }
    case "move": {
      const targetGroup = await prisma.group.findUnique({
        where: { id: parsed.data.groupId },
        include: { _count: { select: { members: true } } },
      });
      if (!targetGroup) return { ok: false, error: "Группа не найдена" };
      if (targetGroup._count.members >= targetGroup.maxMembers) {
        return { ok: false, error: "Группа заполнена" };
      }
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
