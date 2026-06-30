import type { Request, Response, NextFunction } from "express";
import { registerUser } from "@/modules/auth/auth.service";
import type { RegisterInput } from "@/modules/auth/auth.schema";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await registerUser(req.body as RegisterInput);
    res.status(201).json({
      success: true,
      data: user,
      message: "Đăng ký tài khoản thành công",
    });
  } catch (error) {
    next(error);
  }
};
