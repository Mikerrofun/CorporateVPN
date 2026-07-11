"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { ErrorCode, toErrorCode } from "@/5shared/lib/errors";
import { createGroupSchema, type CreateGroupInput } from "../model/schemas";
import type { ActionResult } from "../model/types";

function generateGroupCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function createGroup(input: CreateGroupInput): Promise<ActionResult<{ groupCode: string }>> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const parsed = createGroupSchema.safeParse(input);
  if (!parsed.success) {
    // В схемах message = ErrorCode
    return { ok: false, errorCode: toErrorCode(parsed.error.issues[0].message) };
  }

  const { name, maxMembers } = parsed.data;

  // Генерируем уникальный код группы
  let groupCode = generateGroupCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.group.findUnique({ where: { groupCode } });
    if (!exists) break;
    groupCode = generateGroupCode();
  }

  try {
    await prisma.group.create({
      data: { name, maxMembers, groupCode },
    });
  } catch (err) {
    console.error(`[createGroup] Не удалось создать группу (${err instanceof Error ? err.message : "unknown error"})`);
    return { ok: false, errorCode: ErrorCode.SOMETHING_WRONG };
  }

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
  return { ok: true, data: { groupCode } };
}
