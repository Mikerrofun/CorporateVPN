import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/5shared/api/prisma";
import { ErrorCode, toErrorCode } from "@/5shared/lib/errors";
import { getClientIp } from "@/5shared/lib/network";
import { checkRateLimit, RATE_LIMITS } from "@/5shared/lib/rateLimit";

const bodySchema = z.object({
  login: z.string().min(1, ErrorCode.FIELDS_REQUIRED),
  password: z.string().min(8, ErrorCode.PASSWORD_MIN_LENGTH_8),
  code: z.string().min(1, ErrorCode.FIELDS_REQUIRED),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { errorCode: toErrorCode(parsed.error.issues[0].message) },
      { status: 400 },
    );
  }

  const { login, password, code } = parsed.data;
  const normalizedLogin = login.toLowerCase().trim();
  const normalizedCode = code.trim().toUpperCase();

  // ── Rate limiting: 3 попытки / 15 мин по IP + login ──────────────────
  const ip = getClientIp(req.headers);
  if (ip === "unknown" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ errorCode: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  const allowed = await checkRateLimit(
    `ratelimit:register:${ip}:${normalizedLogin}`,
    RATE_LIMITS.REGISTER,
  );
  if (!allowed) {
    return NextResponse.json({ errorCode: ErrorCode.RATE_LIMIT_EXCEEDED }, { status: 429 });
  }

  const existing = await prisma.user.findUnique({ where: { login: normalizedLogin } });
  if (existing) {
    return NextResponse.json({ errorCode: ErrorCode.LOGIN_ALREADY_EXISTS }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // ── Тип кода определяется по префиксу ────────────────────────────────
  if (normalizedCode.startsWith("GRP-")) {
    return registerWithGroupCode(normalizedCode, normalizedLogin, passwordHash);
  }
  if (normalizedCode.startsWith("INV-")) {
    return registerWithInviteCode(normalizedCode, normalizedLogin, passwordHash);
  }

  return NextResponse.json({ errorCode: ErrorCode.INVALID_INVITE_CODE }, { status: 400 });
}

/** Регистрация по групповому коду: многоразовый код, ограничен maxMembers. */
async function registerWithGroupCode(
  groupCode: string,
  login: string,
  passwordHash: string,
) {
  const group = await prisma.group.findUnique({
    where: { groupCode },
    include: { _count: { select: { members: true } } },
  });

  if (!group) {
    return NextResponse.json({ errorCode: ErrorCode.INVALID_INVITE_CODE }, { status: 400 });
  }
  if (group.status !== "ACTIVE") {
    return NextResponse.json({ errorCode: ErrorCode.GROUP_SUSPENDED }, { status: 403 });
  }
  if (group._count.members >= group.maxMembers) {
    return NextResponse.json({ errorCode: ErrorCode.GROUP_FULL }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { login, passwordHash, status: "ACTIVE", groupId: group.id },
  });

  // TODO: backend.createVpnUser(user) — при успехе сохранить
  // user.marzbanUsername / user.subscriptionUrl. При ошибке VPN —
  // удалить созданного User и вернуть VPN_PROVISIONING_FAILED.
  void user;

  return NextResponse.json({ ok: true }, { status: 201 });
}

/** Регистрация по персональному коду: одноразовый инвайт, помечается использованным. */
async function registerWithInviteCode(
  code: string,
  login: string,
  passwordHash: string,
) {
  const invite = await prisma.invite.findUnique({
    where: { code },
    include: { group: true },
  });

  if (!invite) {
    return NextResponse.json({ errorCode: ErrorCode.INVITE_NOT_FOUND }, { status: 400 });
  }
  if (invite.usedAt) {
    return NextResponse.json({ errorCode: ErrorCode.INVITE_ALREADY_USED }, { status: 409 });
  }
  if (invite.group.status !== "ACTIVE") {
    return NextResponse.json({ errorCode: ErrorCode.GROUP_SUSPENDED }, { status: 403 });
  }

  const memberCount = await prisma.user.count({ where: { groupId: invite.groupId } });
  if (memberCount >= invite.group.maxMembers) {
    return NextResponse.json({ errorCode: ErrorCode.GROUP_FULL }, { status: 409 });
  }

  // Транзакция: создаём User и помечаем инвайт использованным атомарно.
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { login, passwordHash, status: "ACTIVE", groupId: invite.groupId },
    });
    await tx.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date(), usedById: created.id },
    });
    return created;
  });

  // TODO: backend.createVpnUser(user) — при успехе сохранить
  // user.marzbanUsername / user.subscriptionUrl. При ошибке VPN —
  // откатить: удалить User и сбросить usedAt/usedById инвайта,
  // вернуть VPN_PROVISIONING_FAILED.
  void user;

  return NextResponse.json({ ok: true }, { status: 201 });
}
