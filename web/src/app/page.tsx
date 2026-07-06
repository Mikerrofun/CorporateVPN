import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/5shared/session/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user.role === "ADMIN") redirect("/admin");
  if (session?.user.role === "EMPLOYEE") redirect("/dashboard");
  redirect("/login");
}
