import { redirect } from "next/navigation";
import Link from "next/link";

import { requireEmployeeSession } from "@/5shared/session/guards";
import { prisma } from "@/5shared/api/prisma";
import { SignOutButton } from "@/5shared/ui/SignOutButton";

const NAV = [
  { id: "nav-profile", href: "/dashboard", label: "Профиль и подключение" },
  { id: "nav-support", href: "/dashboard/support", label: "Поддержка" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireEmployeeSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { company: true },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-panel/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between sm:block">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-sm font-bold tracking-tight text-white">{user.company.name}</p>
              </div>
              <p className="mt-0.5 text-xs font-mono text-slate-400">Код: {user.company.code}</p>
            </div>
            {/* Show SignOut on mobile next to title if desired, or let it stack */}
            <div className="sm:hidden">
              <SignOutButton />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap gap-1.5">
              {NAV.map((item) => (
                <Link
                  id={item.id}
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="hidden sm:block">
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
