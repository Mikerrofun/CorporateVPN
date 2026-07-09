import type { Group, User } from "@prisma/client";

/** Группа со счётчиком участников — для списка в админке */
export type GroupWithCount = Group & {
  _count: { members: number };
};

/** Группа с участниками — для детальной страницы */
export type GroupWithMembers = Group & {
  members: Pick<User, "id" | "login" | "status">[];
  _count: { members: number };
};

/** Результат Server Action — реэкспорт из shared для обратной совместимости */
export type { ActionResult } from "@/5shared/lib/types/action-result";
