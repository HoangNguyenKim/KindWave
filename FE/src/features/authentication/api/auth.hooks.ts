import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import {
  loginRequest,
  registerRequest,
  type LoginData,
  type LoginPayload,
  type RegisterPayload,
  type AuthUser,
} from "@/features/authentication/api/auth.api";

type LoginOptions = Omit<
  UseMutationOptions<LoginData, unknown, LoginPayload>,
  "mutationFn"
>;

type RegisterOptions = Omit<
  UseMutationOptions<AuthUser, unknown, RegisterPayload>,
  "mutationFn"
>;

export const useLogin = (options?: LoginOptions) =>
  useMutation<LoginData, unknown, LoginPayload>({
    mutationFn: loginRequest,
    ...options,
  });

export const useRegister = (options?: RegisterOptions) =>
  useMutation<AuthUser, unknown, RegisterPayload>({
    mutationFn: registerRequest,
    ...options,
  });
