import { z } from "zod";
import { ErrorCode } from "@/5shared/lib/errors";

// message = ErrorCode: клиент переводит код в текст через getErrorMessage
export const createGroupSchema = z.object({
  name: z.string().min(1, ErrorCode.GROUP_NAME_REQUIRED).max(120),
  maxMembers: z.number().int().min(1).max(1000),
});

export const groupActionSchema = z.union([
  z.object({ action: z.literal("suspend") }),
  z.object({ action: z.literal("resume") }),
  z.object({ action: z.literal("rotate") }),
  z.object({ action: z.literal("delete") }),
]);

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type GroupAction = z.infer<typeof groupActionSchema>;
