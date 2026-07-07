import { z } from "zod";

export const userActionSchema = z.union([
  z.object({ action: z.literal("ban") }),
  z.object({ action: z.literal("unban") }),
  z.object({ action: z.literal("delete") }),
  z.object({
    action: z.literal("move"),
    groupId: z.string().min(1, "Укажите группу"),
  }),
]);

export type UserAction = z.infer<typeof userActionSchema>;
