"use server";

import { revalidatePath } from "next/cache";

import { backend, BackendError } from "@/5shared/api/backend-client";
import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { groupActionSchema, type GroupAction } from "../model/schemas";
import type { ActionResult } from "../model/types";

export async function groupAction(
  groupId: string,
  input: GroupAction,
): Promise<ActionResult<{ subscriptionUrl?: string }>> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, error: "Unauthorized" };

  const parsed = groupActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Некорректный запрос" };

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { ok: false, error: "Группа не найдена" };
  if (!group.marzbanUsername) {
    return { ok: false, error: "VPN-аккаунт ещё не выдан для этой группы" };
  }

  const audit = (action: string, details?: string) =>
    prisma.adminAuditLog
      .create({
        data: {
          adminLogin: process.env.ADMIN_LOGIN ?? "admin",
          action,
          details: details ?? `group=${group.name}`,
        },
      })
      .catch(() => null);

  try {
    switch (parsed.data.action) {
      case "suspend": {
        await backend.setStatus(group.marzbanUsername, "disabled");
        await prisma.group.update({ where: { id: group.id }, data: { status: "SUSPENDED" } });
        await audit("group_suspend");
        break;
      }
      case "resume": {
        await backend.setStatus(group.marzbanUsername, "active");
        await prisma.group.update({ where: { id: group.id }, data: { status: "ACTIVE" } });
        await audit("group_resume");
        break;
      }
      case "rotate": {
        const { subscription_url } = await backend.rotateKey(group.marzbanUsername);
        await prisma.group.update({ where: { id: group.id }, data: { subscriptionUrl: subscription_url } });
        await audit("group_rotate");
        revalidatePath("/admin");
        return { ok: true, data: { subscriptionUrl: subscription_url } };
      }
      case "delete": {
        await backend.setStatus(group.marzbanUsername, "disabled").catch(() => null);
        await prisma.group.delete({ where: { id: group.id } });
        await audit("group_delete");
        break;
      }
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    const detail = err instanceof BackendError ? err.message : "unknown error";
    return { ok: false, error: `Действие не выполнено (${detail})` };
  }
}
