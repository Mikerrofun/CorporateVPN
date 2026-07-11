"use client";

import { Input, SubmitButton, FormCard, FormErrorBlock, AuthLink } from "@/5shared/ui";
import { useUserRegister } from "../model/useUserRegister";

export function UserRegisterForm() {
  const { register, handleSubmit, formErrors, submitCount, isSubmitting, passwordVisibility } = useUserRegister();

  return (
    <FormCard 
      badge="Corporate VPN" 
      title="Регистрация"
      subtitle="Создайте свой аккаунт"
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
          placeholder="Минимум 8 символов"
          passwordVisibility={passwordVisibility}
          {...register("password")}
        />
        
        <Input
          label="Код доступа"
          type="text"
          placeholder="XXX-XXXXXXXXX"
          className="uppercase tracking-wider"
          {...register("code", {
            setValueAs: (v) => v.toUpperCase()
          })}
        />
        
        <SubmitButton loading={isSubmitting} className="w-full py-3">
          Зарегистрироваться
        </SubmitButton>
      </form>
      
      <p className="mt-4 text-center text-xs text-slate-500">
        Код доступа получите у администратора вашей компании.
      </p>
      
      <AuthLink href="/login" text="Уже есть аккаунт?" linkText="Войти" />
    </FormCard>
  );
}
