import type { Group, User } from "@prisma/client";

/** Группа со счётчиком участников — для списка в админке */
export type GroupWithCount = Group & {
  _count: { members: number };
};

/** Группа с участниками — для детальной страницы */
export type GroupWithMembers = Group & {
  members: Pick<User, "id" | "login" | "name" | "status">[];
  _count: { members: number };
};

/** Результат Server Action — единый формат ответа */
export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
