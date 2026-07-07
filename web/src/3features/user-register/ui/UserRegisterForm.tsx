"use client";

import { Input, SubmitButton, FormCard, ErrorMessage, AuthLink } from "@/5shared/ui";
import { useUserRegister } from "../model/useUserRegister";

export function UserRegisterForm() {
  const { register, handleSubmit, errors, isSubmitting, serverError, passwordVisibility } = useUserRegister();

  return (
    <FormCard 
      badge="Corporate VPN" 
      title="Регистрация"
      subtitle="Создайте свой аккаунт"
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
          placeholder="Минимум 8 символов"
          passwordVisibility={passwordVisibility}
          error={errors.password?.message}
          {...register("password")}
        />
        
        <Input
          label="Инвайт-код группы"
          type="text"
          placeholder="XXXXXXXX"
          className="uppercase tracking-wider"
          error={errors.inviteCode?.message}
          {...register("inviteCode", {
            setValueAs: (v) => v.toUpperCase()
          })}
        />
        
        {serverError && <ErrorMessage message={serverError} />}
        
        <SubmitButton loading={isSubmitting} className="w-full py-3">
          Зарегистрироваться
        </SubmitButton>
      </form>
      
      <p className="mt-4 text-center text-xs text-slate-500">
        Инвайт-код получите у администратора вашей компании.
      </p>
      
      <AuthLink href="/login" text="Уже есть аккаунт? Войти" />
    </FormCard>
  );
}
