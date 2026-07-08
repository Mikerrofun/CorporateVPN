import { z } from "zod";

export const userRegisterSchema = z
  .object({
    login: z.string(),
    password: z.string(),
    inviteCode: z.string(),
  })
  .superRefine((data, ctx) => {
    const login = data.login.trim();
    const password = data.password;
    const inviteCode = data.inviteCode.trim();

    if (login.length < 1 || password.length < 1 || inviteCode.length < 1) {
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

      if (inviteCode.length < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["inviteCode"],
          message: "Заполните все поля",
        });
      }
      return;
    }

    if (password.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Пароль минимум 8 символов",
      });
    }
  });

export type UserRegisterFormValues = z.infer<typeof userRegisterSchema>;
