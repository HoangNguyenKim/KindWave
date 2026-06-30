import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { register } from "@/modules/auth/auth.controller";
import { registerSchema } from "@/modules/auth/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);

export { router as authRouter };
