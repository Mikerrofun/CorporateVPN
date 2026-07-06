import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminLoginSchema, AdminLoginFormValues } from "./adminLoginSchema";

export function useAdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { login: "", password: "" },
  });

  async function onSubmit(values: AdminLoginFormValues) {
    setLoading(true);
    setError(null);

    const res = await signIn("admin-login", {
      login: values.login,
      password: values.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Неверный логин или пароль");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return { form, onSubmit, error, loading };
}
