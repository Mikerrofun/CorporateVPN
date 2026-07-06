import { z } from "zod";

export const adminLoginSchema = z.object({
  login: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
