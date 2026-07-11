"use server";

import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";

/** Инвайт с информацией об использовании — для таблицы в админке. */
export type InviteInfo = {
  id: string;
  code: string;
  usedAt: Date | null;
  usedBy: { login: string } | null;
  createdAt: Date;
};

/**
 * Возвращает все инвайты группы, отсортированные по дате создания (новые сверху).
 * Требует админскую сессию — иначе пустой массив.
 */
export async function getInvites(groupId: string): Promise<InviteInfo[]> {
  const session = await requireAdminSession();
  if (!session) return [];

  return prisma.invite.findMany({
    where: { groupId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      usedAt: true,
      createdAt: true,
      usedBy: { select: { login: true } },
    },
  });
}
