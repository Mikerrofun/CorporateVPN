import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { usePasswordVisibility } from "@/5shared/lib/hooks";
import { getErrorMessage } from "@/5shared/lib/errors";
import { userRegisterSchema, UserRegisterFormValues } from "./userRegisterSchema";

export function useUserRegister() {
  const [serverError, setServerError] = useState<string | null>(null);
  const passwordVisibility = usePasswordVisibility();

  const form = useForm<UserRegisterFormValues>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: { login: "", password: "", code: "" },
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
      setServerError(getErrorMessage(data.errorCode, "Ошибка регистрации"));
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

  // В схемах message = ErrorCode — переводим код в текст
  const fieldMessages = Object.values(form.formState.errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))
    .map((code) => getErrorMessage(code));

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
