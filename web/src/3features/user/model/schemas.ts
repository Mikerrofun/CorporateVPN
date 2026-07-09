import { z } from "zod";
import { ErrorCode } from "@/5shared/lib/errors";

// message = ErrorCode: клиент переводит код в текст через getErrorMessage
export const userActionSchema = z.union([
  z.object({ action: z.literal("ban") }),
  z.object({ action: z.literal("unban") }),
  z.object({ action: z.literal("delete") }),
  z.object({
    action: z.literal("move"),
    groupId: z.string().min(1, ErrorCode.GROUP_REQUIRED),
  }),
]);

export type UserAction = z.infer<typeof userActionSchema>;
