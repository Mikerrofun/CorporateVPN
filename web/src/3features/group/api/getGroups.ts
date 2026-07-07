import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import type { GroupWithMembers } from "../model/types";

/**
 * Получить все группы с участниками.
 * Вызывается напрямую из Server Component — без fetch, без API роута.
 */
export async function getGroups(): Promise<GroupWithMembers[]> {
  const session = await requireAdminSession();
  if (!session) return [];

  return prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        select: { id: true, login: true, status: true },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { members: true } },
    },
  });
}
