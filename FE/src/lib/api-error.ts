import { AxiosError } from "axios";

interface ApiErrorBody {
  message?: string;
  error_code?: string;
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) {
      return body.message;
    }
  }
  return fallback;
};
