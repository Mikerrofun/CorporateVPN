import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/5shared/api/prisma";
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

  // Живая проверка статуса: JWT-сессия живёт 2 месяца, бан должен
  // действовать немедленно, а не после истечения токена.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true, group: { select: { status: true } } },
  });
  if (!user) return null;
  // Мертвец: инвайт удалён админом — сессия невалидна, на вход.
  if (user.status === "DELETED") redirect("/login");
  if (user.status === "BANNED" || user.group.status === "SUSPENDED") {
    redirect("/suspended");
  }


  // groupId гарантированно string после проверки выше
  return session as typeof session & { user: { groupId: string } };
}
