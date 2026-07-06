import { z } from "zod";

export const userLoginSchema = z.object({
  login: z.string().min(1, "Введите логин"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export type UserLoginFormValues = z.infer<typeof userLoginSchema>;
