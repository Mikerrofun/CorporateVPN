import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/5shared/session/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user.isAdmin) redirect("/admin");
  if (session?.user.groupId) redirect("/dashboard");
  redirect("/login");
}
