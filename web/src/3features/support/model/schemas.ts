import { z } from "zod";

export const createTicketSchema = z.object({
  topic: z.enum(["CONNECTION", "SPEED", "ACCOUNT", "OTHER"], {
    errorMap: () => ({ message: "Выберите тему обращения" }),
  }),
  message: z.string().min(1, "Напишите сообщение").max(2000),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
