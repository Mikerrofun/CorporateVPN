"use client";

import { Input, SubmitButton, FormCard, FormErrorBlock } from "@/5shared/ui";
import { useAdminLogin } from "../model/useAdminLogin";

export function AdminLoginForm() {
  const { register, handleSubmit, formErrors, isSubmitting, passwordVisibility } = useAdminLogin();

  return (
    <FormCard 
      badge="Corporate VPN" 
      title="Панель управления"
      subtitle="Вход для администратора"
      badgeColor="indigo"
    >
      <FormErrorBlock messages={formErrors} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Логин"
          type="text"
          placeholder="admin"
          autoComplete="username"
          {...register("login")}
        />
        
        <Input
          label="Пароль"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          passwordVisibility={passwordVisibility}
          {...register("password")}
        />
        
        <SubmitButton loading={isSubmitting} className="w-full py-3">
          Войти
        </SubmitButton>
      </form>
    </FormCard>
  );
}
