import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { register, login } from "@/modules/auth/auth.controller";
import { registerSchema, loginSchema } from "@/modules/auth/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export { router as authRouter };
