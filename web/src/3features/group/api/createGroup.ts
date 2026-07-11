"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { ErrorCode, toErrorCode } from "@/5shared/lib/errors";
import { generateGroupCode } from "@/5shared/lib/codes";
import { createGroupSchema, type CreateGroupInput } from "../model/schemas";
import type { ActionResult } from "../model/types";

export async function createGroup(input: CreateGroupInput): Promise<ActionResult<{ groupCode: string }>> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const parsed = createGroupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errorCode: toErrorCode(parsed.error.issues[0].message) };
  }

  const { name, maxMembers } = parsed.data;

  const groupCode = await generateGroupCode();

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
