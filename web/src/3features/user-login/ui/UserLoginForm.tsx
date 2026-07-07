"use client";

import { Input, SubmitButton, FormCard, ErrorMessage, AuthLink } from "@/5shared/ui";
import { useUserLogin } from "../model/useUserLogin";

export function UserLoginForm() {
  const { register, handleSubmit, errors, isSubmitting, serverError } = useUserLogin();

  return (
    <FormCard 
      badge="Corporate VPN" 
      title="Личный кабинет"
      badgeColor="blue"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Логин"
          type="text"
          placeholder="username"
          error={errors.login?.message}
          {...register("login")}
        />
        
        <Input
          label="Пароль"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        
        {serverError && <ErrorMessage message={serverError} />}
        
        <SubmitButton loading={isSubmitting} className="w-full py-3">
          Войти
        </SubmitButton>
      </form>
      
      <AuthLink href="/register" text="Нет аккаунта? Зарегистрироваться" />
    </FormCard>
  );
}
