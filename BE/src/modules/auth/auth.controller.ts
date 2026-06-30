import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "@/modules/auth/auth.service";
import type { RegisterInput, LoginInput } from "@/modules/auth/auth.schema";

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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body as LoginInput);
    res.status(200).json({
      success: true,
      data: { user, accessToken, refreshToken },
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    next(error);
  }
};
