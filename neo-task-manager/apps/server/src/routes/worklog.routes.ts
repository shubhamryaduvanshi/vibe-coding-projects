import { Router } from "express";
import { WorklogController } from "../controllers/worklog.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.js";
import { worklogCreateSchema } from "../schemas/worklog.schema.js";

export const createWorklogRoutes = (controller: WorklogController) => {
  const router = Router();

  router.use(requireAuth);
  router.post("/:taskId", validateBody(worklogCreateSchema), controller.createWorklog);

  return router;
};

