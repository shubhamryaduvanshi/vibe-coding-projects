import { z } from "zod";

export const worklogCreateSchema = z.object({
  hours: z.number().positive().max(24),
  description: z.string().trim().min(1).max(1000)
});

