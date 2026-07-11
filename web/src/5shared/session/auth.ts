import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/5shared/api/prisma";
import { ErrorCode } from "@/5shared/lib/errors";
import { getClientIp } from "@/5shared/lib/network";
import { checkRateLimit, RATE_LIMITS } from "@/5shared/lib/rateLimit";

/**
 * Двухуровневый rate limiting для входа:
 * Level 1 (IP): 20 попыток / 10 мин — защита от credential stuffing.
 * Level 2 (Account, IP+login): 5 попыток / 10 мин — защита от brute force.
 * Блокировка при превышении ЛЮБОГО лимита.
 * Бросает Error(ErrorCode) — NextAuth передаст его в res.error на клиенте.
 */

async function enforceLoginRateLimit(
  headers: Record<string, string | string[] | undefined> | undefined,
  login: string,
): Promise<void> {
  const ip = getClientIp(headers ?? {});
  if (ip === "unknown" && process.env.NODE_ENV === "production") {
    throw new Error(ErrorCode.FORBIDDEN);
  }

  const [ipAllowed, accountAllowed] = await Promise.all([
    checkRateLimit(`ratelimit:login:ip:${ip}`, RATE_LIMITS.LOGIN_BY_IP),
    checkRateLimit(`ratelimit:login:account:${ip}:${login}`, RATE_LIMITS.LOGIN_BY_ACCOUNT),
  ]);

  if (!ipAllowed || !accountAllowed) {
    throw new Error(ErrorCode.RATE_LIMIT_EXCEEDED);
  }
}

export const authOptions: AuthOptions = {
  // maxAge управляет и сроком JWT, и сроком сессии — держим сессию 2 месяца.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    // ─── Провайдер 1: Вход администратора ───────────────────────────────────
    // Логин + пароль из .env. Admin не хранится в БД.
    // Страница: /admin/login
    CredentialsProvider({
      id: "admin-login",
      name: "Admin",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.login || !credentials.password) return null;

        const login = credentials.login.trim();
        await enforceLoginRateLimit(req?.headers, login.toLowerCase());

        const adminLogin = process.env.ADMIN_LOGIN;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminLogin || !adminHash) return null;

        if (login !== adminLogin) return null;

        const valid = await bcrypt.compare(credentials.password, adminHash);
        if (!valid) return null;

        return {
          id: "admin",
          name: "Admin",
          isAdmin: true,
          groupId: null,
        };
      },
    }),

    // ─── Провайдер 2: Вход сотрудника ───────────────────────────────────────
    // Email + пароль. Сотрудник зарегистрирован через /register по invite-коду.
    // Страница: /login
    CredentialsProvider({
      id: "employee-login",
      name: "Employee",
      credentials: {
        login: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.login || !credentials.password) return null;

        const normalizedLogin = credentials.login.toLowerCase().trim();
        await enforceLoginRateLimit(req?.headers, normalizedLogin);

        const user = await prisma.user.findUnique({
          where: { login: normalizedLogin },
          include: { group: { select: { status: true } } },
        });

        if (!user) return null;
        if (user.status !== "ACTIVE") return null;
        if (user.group.status !== "ACTIVE") return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.login,
          isAdmin: false,
          groupId: user.groupId,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.isAdmin = user.isAdmin;
        token.groupId = user.groupId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.isAdmin = token.isAdmin;
        session.user.groupId = token.groupId;
      }
      return session;
    },
  },
};
