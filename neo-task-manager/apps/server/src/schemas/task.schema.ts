import { TASK_STATUSES } from "@neo/types";
import { z } from "zod";

const taskStatusEnum = z.enum(TASK_STATUSES as [string, ...string[]]);

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(4000).optional().default(""),
  dueDate: z.string().datetime().nullable().optional().default(null)
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(4000).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  status: taskStatusEnum.optional()
});

export const taskReorderSchema = z.object({
  taskId: z.string().min(1),
  sourceStatus: taskStatusEnum,
  destinationStatus: taskStatusEnum,
  sourceIndex: z.number().int().min(0),
  destinationIndex: z.number().int().min(0)
});
