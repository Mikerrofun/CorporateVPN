import { z } from "zod";
import { ErrorCode } from "@/5shared/lib/errors";

// message = ErrorCode: клиент переводит код в текст через getErrorMessage
export const createTicketSchema = z.object({
  topic: z.enum(["CONNECTION", "SPEED", "ACCOUNT", "OTHER"], {
    errorMap: () => ({ message: ErrorCode.TOPIC_REQUIRED }),
  }),
  message: z.string().min(1, ErrorCode.MESSAGE_REQUIRED).max(2000),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
