import { getServerSession } from "next-auth";

import { authOptions } from "@/5shared/session/auth";

/** Platform admin: the only role allowed into /admin. Creates corporations and
 * manages their employees. */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

/** Corporation employee: has VPN dashboard access, sees their company's shared
 * subscription link. Never /admin access. */
export async function requireEmployeeSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") return null;
  return session;
}
