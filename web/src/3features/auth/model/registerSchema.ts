import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль минимум 8 символов"),
  name: z.string().min(1).optional(),
  inviteCode: z.string().min(1, "Инвайт-код обязателен"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
