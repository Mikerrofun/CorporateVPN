import { redirect } from "next/navigation";
import Link from "next/link";

import { requireAdminSession } from "@/5shared/session/guards";
import { SignOutButton } from "@/5shared/ui/SignOutButton";

const NAV = [
  { href: "/admin", label: "Группы" },
  { href: "/admin/support", label: "Поддержка" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-panel/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-sm font-bold tracking-tight text-white">Панель администратора</p>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex gap-1.5">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
