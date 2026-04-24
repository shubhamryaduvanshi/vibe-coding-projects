import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

export const createAuthRoutes = (controller: AuthController) => {
  const router = Router();

  router.post("/register", validateBody(registerSchema), controller.register);
  router.post("/login", validateBody(loginSchema), controller.login);
  router.post("/refresh", controller.refresh);
  router.post("/logout", requireAuth, controller.logout);

  return router;
};

