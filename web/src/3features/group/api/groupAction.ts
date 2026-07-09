"use server";

import { revalidatePath } from "next/cache";

import { backend, BackendError } from "@/5shared/api/backend-client";
import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { ErrorCode } from "@/5shared/lib/errors";
import { groupActionSchema, type GroupAction } from "../model/schemas";
import type { ActionResult } from "../model/types";

export async function groupAction(
  groupId: string,
  input: GroupAction,
): Promise<ActionResult<{ subscriptionUrl?: string }>> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const parsed = groupActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errorCode: ErrorCode.VALIDATION_ERROR };

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { ok: false, errorCode: ErrorCode.GROUP_NOT_FOUND };
  if (!group.marzbanUsername) {
    return { ok: false, errorCode: ErrorCode.VPN_NOT_PROVISIONED };
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
    console.error(`[groupAction] Действие не выполнено (${detail})`);
    return { ok: false, errorCode: ErrorCode.SOMETHING_WRONG };
  }
}
