import { z } from "zod";
import { ErrorCode } from "@/5shared/lib/errors";

// message = ErrorCode: клиент переводит код в текст через getErrorMessage
export const adminLoginSchema = z
  .object({
    login: z.string(),
    password: z.string(),
  })
  .superRefine((data, ctx) => {
    const login = data.login.trim();
    const password = data.password;

    if (login.length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["login"],
        message: ErrorCode.FIELDS_REQUIRED,
      });
    }

    if (password.length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: ErrorCode.FIELDS_REQUIRED,
      });
    }
  });

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
