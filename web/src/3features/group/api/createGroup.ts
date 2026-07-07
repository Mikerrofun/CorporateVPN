"use server";

import { revalidatePath } from "next/cache";

import { backend, BackendError } from "@/5shared/api/backend-client";
import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { createGroupSchema, type CreateGroupInput } from "../model/schemas";
import type { ActionResult } from "../model/types";

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function createGroup(input: CreateGroupInput): Promise<ActionResult<{ inviteCode: string }>> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, error: "Unauthorized" };

  const parsed = createGroupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { name, maxMembers } = parsed.data;

  // Генерируем уникальный invite-код
  let inviteCode = generateInviteCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.group.findUnique({ where: { inviteCode } });
    if (!exists) break;
    inviteCode = generateInviteCode();
  }

  // Создаём группу в БД
  const group = await prisma.group.create({
    data: { name, maxMembers, inviteCode },
  });

  // Выдаём VPN аккаунт через Python backend → Marzban
  try {
    const provisioned = await backend.createVpnUser();

    await prisma.group.update({
      where: { id: group.id },
      data: {
        marzbanUsername: provisioned.username,
        subscriptionUrl: provisioned.subscription_url,
      },
    });

    await prisma.adminAuditLog
      .create({
        data: {
          adminLogin: process.env.ADMIN_LOGIN ?? "admin",
          action: "group_create",
          details: `group=${name} maxMembers=${maxMembers}`,
        },
      })
      .catch(() => null);

    revalidatePath("/admin");
    return { ok: true, data: { inviteCode } };
  } catch (err) {
    // Откатываем если VPN не выдался
    await prisma.group.delete({ where: { id: group.id } }).catch(() => null);
    const detail = err instanceof BackendError ? err.message : "unknown error";
    return { ok: false, error: `Не удалось выдать VPN (${detail})` };
  }
}
