import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { ENV } from "@/config/env.config";
import { tokenStorage } from "@/lib/token-storage";

export const apiClient = axios.create({
  baseURL: ENV.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

interface FailedRequestQueue {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequestQueue[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Đưa request vào hàng đợi mutex nếu đang refresh token để tránh infinite race conditions
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      tokenStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      // Dùng axios cơ bản để tránh kích hoạt lại interceptor (tránh loop)
      const response = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${ENV.VITE_API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      processQueue(null, accessToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      // Reset state, xoá storage và yêu cầu đăng nhập lại nếu refresh lỗi
      processQueue(refreshError, null);
      tokenStorage.clear();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
