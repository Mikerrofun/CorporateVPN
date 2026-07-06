import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/5shared/session/guards";
import { prisma } from "@/5shared/api/prisma";

const bodySchema = z.object({
  companyId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректные данные сотрудника" }, { status: 400 });

  const { companyId, email, password, name } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return NextResponse.json({ error: "Корпорация не найдена" }, { status: 404 });

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return NextResponse.json({ error: "Этот email уже существует" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, name: name?.trim() || null, passwordHash, role: "EMPLOYEE", companyId },
  });

  await prisma.adminAuditLog
    .create({
      data: {
        companyId,
        adminId: session.user.id,
        action: "employee_create",
        targetUserId: user.id,
        details: `email=${normalizedEmail}`,
      },
    })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
