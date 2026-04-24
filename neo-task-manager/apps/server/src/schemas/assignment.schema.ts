import { z } from "zod";

export const assignmentSchema = z.object({
  assigneeId: z.string().min(1).nullable()
});

