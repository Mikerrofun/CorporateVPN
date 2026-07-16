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
      invites: {
        select: {
          id: true,
          code: true,
          createdAt: true,
          usedAt: true,
          usedBy: {
            select: { id: true, login: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { members: { where: { status: { not: "DELETED" } } } } },
    },
  });
}
