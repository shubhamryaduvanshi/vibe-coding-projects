import { Router } from "express";
import { AssignmentController } from "../controllers/assignment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.js";
import { assignmentSchema } from "../schemas/assignment.schema.js";

export const createAssignmentRoutes = (controller: AssignmentController) => {
  const router = Router();

  router.use(requireAuth);
  router.patch("/:taskId", validateBody(assignmentSchema), controller.assignTask);

  return router;
};

