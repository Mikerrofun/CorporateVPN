import NextAuth from "next-auth";

import { authOptions } from "@/5shared/session/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
