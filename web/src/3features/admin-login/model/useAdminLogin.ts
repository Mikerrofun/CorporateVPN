import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { adminLoginSchema, AdminLoginFormValues } from "./adminLoginSchema";

export function useAdminLogin() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { login: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  async function handleSubmit(values: AdminLoginFormValues) {
    setWasSubmitted(true);
    setServerError(null);

    const res = await signIn("admin-login", {
      login: values.login,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      setServerError("Неверный логин или пароль");
      return;
    }

    // Редирект обрабатывается через Redirector
  }

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(handleSubmit),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    serverError,
  };
}
