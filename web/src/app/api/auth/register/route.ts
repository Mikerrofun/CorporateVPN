import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/5shared/api/prisma";

const bodySchema = z.object({
  login: z.string().min(1, "Введите логин"),
  password: z.string().min(8, "Пароль минимум 8 символов"),
  inviteCode: z.string().min(1, "Инвайт-код обязателен"),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { login, password, inviteCode } = parsed.data;
  const normalizedLogin = login.toLowerCase().trim();

  // Найти группу по invite-коду
  const group = await prisma.group.findUnique({
    where: { inviteCode },
    include: { _count: { select: { members: true } } },
  });

  if (!group) {
    return NextResponse.json({ error: "Инвайт-код недействителен" }, { status: 400 });
  }
  if (group.status !== "ACTIVE") {
    return NextResponse.json({ error: "Группа приостановлена" }, { status: 403 });
  }
  if (group._count.members >= group.maxMembers) {
    return NextResponse.json({ error: "Группа заполнена" }, { status: 409 });
  }

  // Проверить что логин не занят
  const existing = await prisma.user.findUnique({ where: { login: normalizedLogin } });
  if (existing) {
    return NextResponse.json({ error: "Логин уже зарегистрирован" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      login: normalizedLogin,
      passwordHash,
      status: "ACTIVE",
      groupId: group.id,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
