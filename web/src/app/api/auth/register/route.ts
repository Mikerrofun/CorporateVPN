import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/5shared/api/prisma";
import { ErrorCode, toErrorCode } from "@/5shared/lib/errors";
import { getClientIp } from "@/5shared/lib/network";
import { checkRateLimit, RATE_LIMITS } from "@/5shared/lib/rateLimit";

// message = ErrorCode: клиент переводит код в текст через getErrorMessage
const bodySchema = z.object({
  login: z.string().min(1, ErrorCode.FIELDS_REQUIRED),
  password: z.string().min(8, ErrorCode.PASSWORD_MIN_LENGTH_8),
  inviteCode: z.string().min(1, ErrorCode.FIELDS_REQUIRED),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { errorCode: toErrorCode(parsed.error.issues[0].message) },
      { status: 400 },
    );
  }

  const { login, password, inviteCode } = parsed.data;
  const normalizedLogin = login.toLowerCase().trim();

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

  // Найти группу по invite-коду
  const group = await prisma.group.findUnique({
    where: { inviteCode },
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

  // Проверить что логин не занят
  const existing = await prisma.user.findUnique({ where: { login: normalizedLogin } });
  if (existing) {
    return NextResponse.json({ errorCode: ErrorCode.LOGIN_ALREADY_EXISTS }, { status: 409 });
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
