import { z } from "zod";

export const userRegisterSchema = z.object({
  login: z.string().min(1, "Введите логин"),
  password: z.string().min(8, "Пароль минимум 8 символов"),
  inviteCode: z.string().min(1, "Инвайт-код обязателен"),
});

export type UserRegisterFormValues = z.infer<typeof userRegisterSchema>;
