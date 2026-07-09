import { z } from "zod";
import { ErrorCode } from "@/5shared/lib/errors";

// message = ErrorCode: клиент переводит код в текст через getErrorMessage
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

      if (inviteCode.length < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["inviteCode"],
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
