import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/5shared/session/auth";
import { prisma } from "@/5shared/api/prisma";

const bodySchema = z.object({
  topic: z.enum(["CONNECTION", "SPEED", "ACCOUNT", "OTHER"]),
  message: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const ticket = await prisma.supportTicket.create({
    data: {
      companyId: session.user.companyId,
      userId: session.user.id,
      topic: parsed.data.topic,
      message: parsed.data.message,
    },
  });
  return NextResponse.json({ ok: true, id: ticket.id });
}
