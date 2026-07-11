import { z } from "zod";
import { ErrorCode } from "@/5shared/lib/errors";

// message = ErrorCode: клиент переводит код в текст через getErrorMessage
export const userRegisterSchema = z
  .object({
    login: z.string(),
    password: z.string(),
    code: z.string(),
  })
  .superRefine((data, ctx) => {
    const login = data.login.trim();
    const password = data.password;
    const code = data.code.trim();

    if (login.length < 1 || password.length < 1 || code.length < 1) {
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

      if (code.length < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["code"],
          message: ErrorCode.FIELDS_REQUIRED,
        });
      }
      return;
    }

    if (password.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: ErrorCode.PASSWORD_MIN_LENGTH_8,
      });
    }
  });

export type UserRegisterFormValues = z.infer<typeof userRegisterSchema>;
