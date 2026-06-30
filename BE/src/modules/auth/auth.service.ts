import bcrypt from "bcrypt";
import { prisma } from "@/config/prisma.client";
import { ConflictError, UnauthorizedError } from "@/errors/app.error";
import type { RegisterInput, LoginInput } from "@/modules/auth/auth.schema";
import { signTokenPair, type TokenPair } from "@/modules/auth/jwt.util";

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
