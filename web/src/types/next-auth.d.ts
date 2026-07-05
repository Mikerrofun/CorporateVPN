import type { DefaultSession } from "next-auth";

export type AppRole = "ADMIN" | "EMPLOYEE";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      companyId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    companyId: string;
  }
}
