import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { usePasswordVisibility } from "@/5shared/lib/hooks";
import { getErrorMessage } from "@/5shared/lib/errors";
import { adminLoginSchema, AdminLoginFormValues } from "./adminLoginSchema";

export function useAdminLogin() {
  const [serverError, setServerError] = useState<string | null>(null);
  const passwordVisibility = usePasswordVisibility();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { login: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  async function handleSubmit(values: AdminLoginFormValues) {
    setServerError(null);

    const res = await signIn("admin-login", {
      login: values.login,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      setServerError(getErrorMessage(res.error, "Неверный логин или пароль"));
      return;
    }

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
