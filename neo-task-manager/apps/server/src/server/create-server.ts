import "express-async-errors";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { env } from "../config/env.js";
import { connectToDatabase } from "../db/mongoose.js";
import { errorHandler } from "../middleware/error-handler.js";
import { UserRepository } from "../repositories/user.repository.js";
import { TaskRepository } from "../repositories/task.repository.js";
import { AssignmentHistoryRepository } from "../repositories/assignment-history.repository.js";
import { WorklogRepository } from "../repositories/worklog.repository.js";
import { AuthService } from "../services/auth.service.js";
import { TaskService } from "../services/task.service.js";
import { AssignmentService } from "../services/assignment.service.js";
import { WorklogService } from "../services/worklog.service.js";
import { ReportService } from "../services/report.service.js";
import { AuthController } from "../controllers/auth.controller.js";
import { TaskController } from "../controllers/task.controller.js";
import { AssignmentController } from "../controllers/assignment.controller.js";
import { WorklogController } from "../controllers/worklog.controller.js";
import { ReportController } from "../controllers/report.controller.js";
import { createAuthRoutes } from "../routes/auth.routes.js";
import { createTaskRoutes } from "../routes/task.routes.js";
import { createAssignmentRoutes } from "../routes/assignment.routes.js";
import { createWorklogRoutes } from "../routes/worklog.routes.js";
import { createReportRoutes } from "../routes/report.routes.js";
import { socketService } from "../services/socket.service.js";

export const createServer = async () => {
  if (env.NODE_ENV !== "test") {
    await connectToDatabase();
  }

  const userRepository = new UserRepository();
  const taskRepository = new TaskRepository();
  const assignmentHistoryRepository = new AssignmentHistoryRepository();
  const worklogRepository = new WorklogRepository();

  const authService = new AuthService(userRepository);
  const assignmentService = new AssignmentService(
    assignmentHistoryRepository,
    taskRepository,
    userRepository
  );
  const worklogService = new WorklogService(worklogRepository, taskRepository);
  const taskService = new TaskService(taskRepository, userRepository);
  const reportService = new ReportService(worklogRepository, taskRepository);

  const authController = new AuthController(authService);
  const taskController = new TaskController(taskService, assignmentService, worklogService);
  const assignmentController = new AssignmentController(assignmentService);
  const worklogController = new WorklogController(worklogService);
  const reportController = new ReportController(reportService);

  const app = express();
  const appServer = http.createServer(app);
  socketService.attach(appServer);

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true
    })
  );
  app.use(cookieParser());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/auth", createAuthRoutes(authController));
  app.use("/tasks", createTaskRoutes(taskController));
  app.use("/assignments", createAssignmentRoutes(assignmentController));
  app.use("/worklogs", createWorklogRoutes(worklogController));
  app.use("/reports", createReportRoutes(reportController));
  app.use(errorHandler);

  return { app, appServer, config: { port: env.PORT } };
};

