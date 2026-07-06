import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/5shared/session/guards";
import { prisma } from "@/5shared/api/prisma";

const bodySchema = z.union([
  z.object({ action: z.literal("ban") }),
  z.object({ action: z.literal("unban") }),
  z.object({ action: z.literal("delete") }),
]);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });

  const employee = await prisma.user.findFirst({ where: { id: params.id, role: "EMPLOYEE" } });
  if (!employee) return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });

  const audit = (action: string) =>
    prisma.adminAuditLog
      .create({ data: { companyId: employee.companyId, adminId: session.user.id, action, targetUserId: employee.id } })
      .catch(() => null);

  if (parsed.data.action === "ban") {
    await prisma.user.update({ where: { id: employee.id }, data: { status: "BANNED" } });
    await audit("employee_ban");
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "unban") {
    await prisma.user.update({ where: { id: employee.id }, data: { status: "ACTIVE" } });
    await audit("employee_unban");
    return NextResponse.json({ ok: true });
  }

  // action === "delete"
  await prisma.user.delete({ where: { id: employee.id } });
  await audit("employee_delete");
  return NextResponse.json({ ok: true });
}
