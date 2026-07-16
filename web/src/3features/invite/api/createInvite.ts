"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import { ErrorCode } from "@/5shared/lib/errors";
import { generateInviteCode } from "@/5shared/lib/codes";

type CreateInviteResult =
  | { ok: true; code: string }
  | { ok: false; errorCode: ErrorCode };


export async function createInvite(groupId: string): Promise<CreateInviteResult> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, errorCode: ErrorCode.UNAUTHORIZED };

  const group = await prisma.group.findUnique({ where: { id: groupId } });

  if (!group) return { ok: false, errorCode: ErrorCode.GROUP_NOT_FOUND };

  // Живые участники: DELETED не занимает слот.
  const memberCount = await prisma.user.count({
    where: { groupId, status: { not: "DELETED" } },
  });
  const unusedInvites = await prisma.invite.count({
    where: { groupId, usedAt: null },
  });

  // Свободные места = maxMembers - (участники + неиспользованные инвайты)
  const occupied = memberCount + unusedInvites;

  if (occupied >= group.maxMembers) {
    return { ok: false, errorCode: ErrorCode.NO_AVAILABLE_SLOTS };
  }

  let code: string;
  try {
    code = await generateInviteCode();
    await prisma.invite.create({ data: { code, groupId } });
  } catch (err) {
    console.error(`[createInvite] Не удалось создать инвайт (${err instanceof Error ? err.message : "unknown error"})`);
    return { ok: false, errorCode: ErrorCode.SOMETHING_WRONG };
  }

  await prisma.adminAuditLog
    .create({
      data: {
        adminLogin: process.env.ADMIN_LOGIN ?? "admin",
        action: "invite_create",
        details: `group=${group.name} code=${code}`,
      },
    })
    .catch(() => null);

  revalidatePath("/admin");
  return { ok: true, code };
}
