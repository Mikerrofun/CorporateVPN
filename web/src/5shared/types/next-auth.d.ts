import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** true — администратор (из env), false — сотрудник (из БД) */
      isAdmin: boolean;
      /** Только для сотрудника. null у администратора. */
      groupId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin: boolean;
    groupId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    isAdmin: boolean;
    groupId: string | null;
  }
}
