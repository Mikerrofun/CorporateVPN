import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { usePasswordVisibility } from "@/5shared/ui";
import { userRegisterSchema, UserRegisterFormValues } from "./userRegisterSchema";

export function useUserRegister() {
  const [serverError, setServerError] = useState<string | null>(null);
  const passwordVisibility = usePasswordVisibility();

  const form = useForm<UserRegisterFormValues>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: { login: "", password: "", inviteCode: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  async function handleSubmit(values: UserRegisterFormValues) {
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

  const fieldMessages = Object.values(form.formState.errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message));

  const formErrors = Array.from(
    new Set(serverError ? [...fieldMessages, serverError] : fieldMessages)
  );

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(handleSubmit),
    formErrors,
    submitCount: form.formState.submitCount,
    isSubmitting: form.formState.isSubmitting,
    passwordVisibility,
  };
}
