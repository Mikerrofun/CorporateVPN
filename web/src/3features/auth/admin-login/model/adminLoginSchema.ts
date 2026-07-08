import { z } from "zod";

export const adminLoginSchema = z
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
  });

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
