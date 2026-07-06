import { AdminLoginForm } from "@/3features/auth/ui/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[80px]" />
      <AdminLoginForm />
    </main>
  );
}
