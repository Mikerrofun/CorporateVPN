import type { DefaultSession } from "next-auth";
import type { OS } from "@/5shared/lib/device/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      groupId: string | null;
      preferredOS?: OS;
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
    preferredOS?: OS;
  }
}
