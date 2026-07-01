import { apiClient } from "@/lib/axios";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const loginRequest = async (payload: LoginPayload): Promise<LoginData> => {
  const { data } = await apiClient.post<ApiEnvelope<LoginData>>("/auth/login", payload);
  return data.data;
};

export const registerRequest = async (payload: RegisterPayload): Promise<AuthUser> => {
  const { data } = await apiClient.post<ApiEnvelope<AuthUser>>("/auth/register", payload);
  return data.data;
};
