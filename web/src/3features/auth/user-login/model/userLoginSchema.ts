import { z } from "zod";

export const userLoginSchema = z
  .object({
    login: z.string(),
    password: z.string(),
  })
  .superRefine((data, ctx) => {
    const login = data.login.trim();
    const password = data.password;

    if (login.length < 1 || password.length < 1) {
      if (login.length < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["login"],
          message: "Заполните все поля",
        });
      }

      if (password.length < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Заполните все поля",
        });
      }
      return;
    }

    if (password.length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Пароль минимум 6 символов",
      });
    }
  });

export type UserLoginFormValues = z.infer<typeof userLoginSchema>;
