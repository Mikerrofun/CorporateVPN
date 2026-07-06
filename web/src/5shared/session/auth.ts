import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/5shared/api/prisma";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
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
      async authorize(credentials) {
        if (!credentials?.login || !credentials.password) return null;

        const adminLogin = process.env.ADMIN_LOGIN;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminLogin || !adminHash) return null;

        if (credentials.login.trim() !== adminLogin) return null;

        const valid = await bcrypt.compare(credentials.password, adminHash);
        if (!valid) return null;

        return {
          id: "admin",
          name: "Admin",
          email: null,
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
      async authorize(credentials) {
        if (!credentials?.login || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { login: credentials.login.toLowerCase().trim() },
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
          email: user.login,
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
