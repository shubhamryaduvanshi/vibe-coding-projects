import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.js";
import {
  taskCreateSchema,
  taskReorderSchema,
  taskUpdateSchema
} from "../schemas/task.schema.js";

export const createTaskRoutes = (controller: TaskController) => {
  const router = Router();

  router.use(requireAuth);
  router.get("/", controller.listBoard);
  router.post("/", validateBody(taskCreateSchema), controller.createTask);
  router.get("/:taskId", controller.getTaskDetails);
  router.patch("/:taskId", validateBody(taskUpdateSchema), controller.updateTask);
  router.post("/reorder", validateBody(taskReorderSchema), controller.reorderTasks);

  return router;
};

