import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, logoutUser, refreshTokens } from "@/modules/auth/auth.service";
import type {
  RegisterInput,
  LoginInput,
  LogoutInput,
  RefreshInput,
} from "@/modules/auth/auth.schema";

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

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await logoutUser(req.body as LogoutInput);
    res.status(200).json({
      success: true,
      data: null,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { accessToken, refreshToken } = await refreshTokens(req.body as RefreshInput);
    res.status(200).json({
      success: true,
      data: { accessToken, refreshToken },
      message: "Làm mới token thành công",
    });
  } catch (error) {
    next(error);
  }
};
