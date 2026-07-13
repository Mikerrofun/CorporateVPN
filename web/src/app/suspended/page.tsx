import type { Metadata } from "next";

import { SignOutButton } from "@/5shared/ui/SignOutButton";

export const metadata: Metadata = {
  title: "Доступ приостановлен",
};

/**
 * Страница для заблокированных сотрудников (User.status = BANNED)
 * или сотрудников приостановленной группы (Group.status = SUSPENDED).
 * Сюда редиректит requireEmployeeSession().
 */
export default function SuspendedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.05] bg-white/[0.02] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white text-balance">
          Ваш доступ приостановлен
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400 text-pretty">
          Доступ к VPN-сервису временно заблокирован администратором. Если вы считаете, что это
          ошибка — обратитесь к администратору вашей компании.
        </p>
        <div className="mt-6 flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
