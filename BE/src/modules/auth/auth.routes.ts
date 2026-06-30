import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { register, login, logout, refresh } from "@/modules/auth/auth.controller";
import {
  registerSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
} from "@/modules/auth/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", validate(logoutSchema), logout);
router.post("/refresh", validate(refreshSchema), refresh);

export { router as authRouter };
