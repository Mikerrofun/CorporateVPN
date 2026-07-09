import { z } from "zod";
import { ErrorCode } from "@/5shared/lib/errors";

// message = ErrorCode: клиент переводит код в текст через getErrorMessage
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
      return;
    }

    if (password.length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: ErrorCode.PASSWORD_MIN_LENGTH_6,
      });
    }
  });

export type UserLoginFormValues = z.infer<typeof userLoginSchema>;
