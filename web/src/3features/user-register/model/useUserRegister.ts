import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { userRegisterSchema, UserRegisterFormValues } from "./userRegisterSchema";

export function useUserRegister() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const form = useForm<UserRegisterFormValues>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: { login: "", password: "", inviteCode: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  async function handleSubmit(values: UserRegisterFormValues) {
    setWasSubmitted(true);
    setServerError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      setServerError(data.error ?? "Ошибка регистрации");
      return;
    }

    // Автологин после регистрации
    await signIn("employee-login", {
      login: values.login,
      password: values.password,
      redirect: false,
    });

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
