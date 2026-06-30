import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "@/errors/app.error";
import { verifyToken, type JwtPayload } from "@/modules/auth/jwt.util";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const extractBearerToken = (header: string | undefined): string => {
  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Thiếu hoặc sai định dạng Authorization header");
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    throw new UnauthorizedError("Access token rỗng");
  }
  return token;
};

const toAuthenticatedUser = (payload: JwtPayload): AuthenticatedUser => ({
  id: payload.sub,
  email: payload.email,
  role: payload.role,
});

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    req.user = toAuthenticatedUser(verifyToken(token));
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Access token đã hết hạn"));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Access token không hợp lệ"));
      return;
    }
    next(error);
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Chưa xác thực"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError("Bạn không có quyền truy cập tài nguyên này"));
      return;
    }
    next();
  };
};
