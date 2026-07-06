"use client";

import { Input, SubmitButton, FormCard, ErrorMessage } from "@/5shared/ui";
import { useAdminLogin } from "../model/useAdminLogin";

export function AdminLoginForm() {
  const { register, handleSubmit, errors, isSubmitting, serverError } = useAdminLogin();

  return (
    <FormCard 
      badge="Corporate VPN" 
      title="Панель управления"
      subtitle="Вход для администратора"
      badgeColor="indigo"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Логин"
          type="text"
          placeholder="admin"
          autoComplete="username"
          error={errors.login?.message}
          {...register("login")}
        />
        
        <Input
          label="Пароль"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        
        {serverError && <ErrorMessage message={serverError} />}
        
        <SubmitButton loading={isSubmitting} className="w-full py-3">
          Войти
        </SubmitButton>
      </form>
    </FormCard>
  );
}
