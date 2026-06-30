import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { ENV } from "@/config/env.config";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const accessOptions: SignOptions = {
  expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
};

const refreshOptions: SignOptions = {
  expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
};

export const signTokenPair = (payload: JwtPayload): TokenPair => ({
  accessToken: jwt.sign(payload, ENV.JWT_SECRET, accessOptions),
  refreshToken: jwt.sign(payload, ENV.JWT_SECRET, refreshOptions),
});

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, ENV.JWT_SECRET);
  if (typeof decoded === "string") {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }
  return {
    sub: String(decoded.sub),
    email: String(decoded.email),
    role: String(decoded.role),
  };
};

export const getRemainingTtlSeconds = (token: string): number => {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === "string" || typeof decoded.exp !== "number") {
    return 0;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - nowSeconds);
};
