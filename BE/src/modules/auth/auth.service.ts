import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/config/prisma.client";
import { redis } from "@/config/redis.client";
import { ConflictError, UnauthorizedError } from "@/errors/app.error";
import type {
  RegisterInput,
  LoginInput,
  RefreshInput,
  LogoutInput,
} from "@/modules/auth/auth.schema";
import {
  signTokenPair,
  verifyToken,
  getRemainingTtlSeconds,
  type TokenPair,
} from "@/modules/auth/jwt.util";

const SALT_ROUNDS = 10;

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: Date;
}

const toPublicUser = (user: {
  id: bigint;
  email: string;
  fullName: string;
  role: string;
  createdAt: Date;
}): PublicUser => ({
  id: user.id.toString(),
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  createdAt: user.createdAt,
});

export const registerUser = async (input: RegisterInput): Promise<PublicUser> => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError("Email đã được đăng ký");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
    },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });

  return toPublicUser(user);
};

export interface LoginResult extends TokenPair {
  user: PublicUser;
}

export const loginUser = async (input: LoginInput): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      passwordHash: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
  }

  const tokens = signTokenPair({
    sub: user.id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    ...tokens,
    user: toPublicUser(user),
  };
};

const blacklistKey = (token: string): string => `auth:blacklist:${token}`;

const assertNotBlacklisted = async (refreshToken: string): Promise<void> => {
  const blacklisted = await redis.get(blacklistKey(refreshToken));
  if (blacklisted) {
    throw new UnauthorizedError("Refresh token đã bị thu hồi");
  }
};

export const logoutUser = async (input: LogoutInput): Promise<void> => {
  const ttl = getRemainingTtlSeconds(input.refreshToken);
  if (ttl > 0) {
    await redis.set(blacklistKey(input.refreshToken), "1", "EX", ttl);
  }
};

export const refreshTokens = async (input: RefreshInput): Promise<TokenPair> => {
  await assertNotBlacklisted(input.refreshToken);

  let payload;
  try {
    payload = verifyToken(input.refreshToken);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Refresh token không hợp lệ hoặc đã hết hạn");
    }
    throw error;
  }

  // Rotation: revoke the used refresh token before issuing a new pair
  const ttl = getRemainingTtlSeconds(input.refreshToken);
  if (ttl > 0) {
    await redis.set(blacklistKey(input.refreshToken), "1", "EX", ttl);
  }

  return signTokenPair({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  });
};
