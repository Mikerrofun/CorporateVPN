import { prisma } from "@/5shared/api/prisma";
import { requireAdminSession } from "@/5shared/session/guards";

/**
 * Получить все тикеты для админ панели.
 * Показывает: юзер (login), группа (name), время, тема, сообщение, статус.
 * Вызывается напрямую из Server Component.
 */
export async function getTickets() {
  const session = await requireAdminSession();
  if (!session) return [];

  return prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      topic: true,
      message: true,
      status: true,
      createdAt: true,
      user: {
        select: { id: true, login: true },
      },
      group: {
        select: { id: true, name: true },
      },
    },
  });
}

export type TicketListItem = Awaited<ReturnType<typeof getTickets>>[number];
