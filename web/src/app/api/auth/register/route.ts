import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  BackendUnavailableError,
  provisionVpnForGroup,
  type VpnProvisionResult,
} from "@/5shared/api/backend-client";
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

  // ── VPN provisioning ──────────────────────────────────────────────
  // Первый пользователь группы: создаём Marzban-аккаунт ДО записи в БД.
  // При ошибке Marzban ничего не создано — User не появляется.
  // Последующие пользователи: копируем VPN-данные из Group.
  if (group.marzbanUsername && group.subscriptionUrl) {
    await prisma.user.create({
      data: {
        login,
        passwordHash,
        status: "ACTIVE",
        groupId: group.id,
        marzbanUsername: group.marzbanUsername,
        subscriptionUrl: group.subscriptionUrl,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const provisioned = await provisionVpn();
  if ("errorCode" in provisioned) {
    return NextResponse.json({ errorCode: provisioned.errorCode }, { status: 502 });
  }

  // Транзакция: сохраняем VPN-данные в Group и создаём User атомарно.
  // Если запись User упадёт — обновление Group откатится вместе с ней.
  await prisma.$transaction([
    prisma.group.update({
      where: { id: group.id },
      data: {
        marzbanUsername: provisioned.marzbanUsername,
        subscriptionUrl: provisioned.subscriptionUrl,
      },
    }),
    prisma.user.create({
      data: {
        login,
        passwordHash,
        status: "ACTIVE",
        groupId: group.id,
        marzbanUsername: provisioned.marzbanUsername,
        subscriptionUrl: provisioned.subscriptionUrl,
      },
    }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}

/**
 * Вызывает backend для создания Marzban-аккаунта группы.
 * Возвращает VPN-данные либо код ошибки (backend недоступен / отказал).
 */
async function provisionVpn(): Promise<VpnProvisionResult | { errorCode: ErrorCode }> {
  try {
    return await provisionVpnForGroup();
  } catch (err) {
    if (err instanceof BackendUnavailableError) {
      return { errorCode: ErrorCode.VPN_BACKEND_UNAVAILABLE };
    }
    return { errorCode: ErrorCode.VPN_PROVISIONING_FAILED };
  }
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

  // ── VPN provisioning ──────────────────────────────────────────────
  // Если у группы ещё нет VPN (пустая группа) — создаём Marzban-аккаунт
  // ДО транзакции. При ошибке Marzban ничего не записано: User не создан,
  // Invite остаётся свободным.
  let vpn: { marzbanUsername: string; subscriptionUrl: string };
  const groupNeedsVpn = !invite.group.marzbanUsername || !invite.group.subscriptionUrl;

  if (groupNeedsVpn) {
    const provisioned = await provisionVpn();
    if ("errorCode" in provisioned) {
      return NextResponse.json({ errorCode: provisioned.errorCode }, { status: 502 });
    }
    vpn = provisioned;
  } else {
    vpn = {
      marzbanUsername: invite.group.marzbanUsername!,
      subscriptionUrl: invite.group.subscriptionUrl!,
    };
  }

  // Транзакция: (Group при первом User) + User + пометка Invite — атомарно.
  await prisma.$transaction(async (tx) => {
    if (groupNeedsVpn) {
      await tx.group.update({
        where: { id: invite.groupId },
        data: { marzbanUsername: vpn.marzbanUsername, subscriptionUrl: vpn.subscriptionUrl },
      });
    }
    const created = await tx.user.create({
      data: {
        login,
        passwordHash,
        status: "ACTIVE",
        groupId: invite.groupId,
        marzbanUsername: vpn.marzbanUsername,
        subscriptionUrl: vpn.subscriptionUrl,
      },
    });
    await tx.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date(), usedById: created.id },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
