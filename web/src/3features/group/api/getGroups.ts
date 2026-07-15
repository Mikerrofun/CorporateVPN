import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";
import type { GroupWithMembers } from "../model/types";

export async function getGroups(): Promise<GroupWithMembers[]> {
  const session = await requireAdminSession();
  if (!session) return [];

  return prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        where: { status: { not: "DELETED" } },
        select: { id: true, login: true, status: true },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { members: { where: { status: { not: "DELETED" } } } } },

    },
  });
}
