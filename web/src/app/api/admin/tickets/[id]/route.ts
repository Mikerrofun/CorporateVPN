import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/5shared/session/guards";
import { prisma } from "@/5shared/api/prisma";

const bodySchema = z.object({ action: z.enum(["close", "reopen"]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: "Обращение не найдено" }, { status: 404 });

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { status: parsed.data.action === "close" ? "CLOSED" : "OPEN" },
  });
  return NextResponse.json({ ok: true });
}
