import { getServerSession } from "next-auth";

import { authOptions } from "@/5shared/session/auth";

/**
 * Проверяет что текущий пользователь — администратор.
 * Используется в API роутах /api/admin/*.
 */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) return null;
  return session;
}

/**
 * Проверяет что текущий пользователь — сотрудник с активной группой.
 * Используется в API роутах /api/dashboard/*.
 */
export async function requireEmployeeSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.isAdmin || !session.user.groupId) return null;
  // groupId гарантированно string после проверки выше
  return session as typeof session & { user: { groupId: string } };
}
