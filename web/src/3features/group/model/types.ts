import type { Group, User } from "@prisma/client";

/** Группа со счётчиком участников — для списка в админке */
export type GroupWithCount = Group & {
  _count: { members: number };
};

/** Группа с участниками — для детальной страницы */
export type GroupWithMembers = Group & {
  members: Pick<User, "id" | "login" | "status">[];
  invites: InviteInfo[];
  _count: { members: number };
};

/** info inv-code */
export type InviteInfo = {
  id: string;
  code: string;
  createdAt: Date;
  usedAt: Date | null;
  usedBy: { id: string; login: string } | null;
};


export type { ActionResult } from "@/5shared/lib/types/action-result";

