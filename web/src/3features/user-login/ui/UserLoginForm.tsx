"use client";

import { Input, SubmitButton, FormCard, FormErrorBlock, AuthLink } from "@/5shared/ui";
import { useUserLogin } from "../model/useUserLogin";

export function UserLoginForm() {
  const { register, handleSubmit, formErrors, submitCount, isSubmitting, passwordVisibility } = useUserLogin();

  return (
    <FormCard 
      badge="Corporate VPN" 
      title="Личный кабинет"
      badgeColor="blue"
    >
      <FormErrorBlock messages={formErrors} resetKey={submitCount} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Логин"
          type="text"
          placeholder="username"
          {...register("login")}
        />
        
        <Input
          label="Пароль"
          type="password"
          placeholder="••••••••"
          passwordVisibility={passwordVisibility}
          {...register("password")}
        />
        
        <SubmitButton loading={isSubmitting} className="w-full py-3">
          Войти
        </SubmitButton>
      </form>
      
      <AuthLink href="/register" text="Нет аккаунта?" linkText="Зарегистрироваться" />
    </FormCard>
  );
}
