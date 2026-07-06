import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/5shared/session/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Уже залогинен — редирект сразу
  if (session?.user.isAdmin) redirect("/admin");
  if (session?.user.groupId) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Corporate VPN</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Добро пожаловать</h1>
          <p className="mt-2 text-sm text-slate-400">Выберите как войти в систему</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Войти как сотрудник
          </Link>

          <Link
            href="/admin/login"
            className="btn-ghost flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Войти как администратор
          </Link>
        </div>
      </div>
    </main>
  );
}
