import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPasswordController,
} from "@/modules/auth/auth.controller";
import {
  registerSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/modules/auth/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", validate(logoutSchema), logout);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPasswordController);

export { router as authRouter };
