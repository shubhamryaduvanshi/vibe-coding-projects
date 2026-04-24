import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const createReportRoutes = (controller: ReportController) => {
  const router = Router();

  router.use(requireAuth);
  router.get("/time", controller.getTimeReport);

  return router;
};

