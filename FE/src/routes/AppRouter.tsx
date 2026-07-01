import { QueryClient } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AuthLayout } from "@/components/common/AuthLayout";
import { MainLayout } from "@/components/common/MainLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: "/",
      errorElement: <div>An unexpected error occurred</div>,
      children: [
        {
          element: <AuthLayout />,
          children: [
            {
              path: "login",
              lazy: async () => {
                const { LoginRoute } = await import("@/features/authentication");
                return { Component: LoginRoute };
              },
            },
            {
              path: "register",
              lazy: async () => {
                const { RegisterRoute } = await import("@/features/authentication");
                return { Component: RegisterRoute };
              },
            },
          ],
        },
        {
          element: <ProtectedRoute allowedRoles={["USER", "ADMIN"]} />,
          children: [
            {
              element: <MainLayout />,
              children: [
                {
                  path: "dashboard",
                  lazy: async () => {
                    const { DashboardRoute } = await import("@/features/dashboard");
                    return { Component: DashboardRoute };
                  },
                  loader: async () => {
                    return queryClient.getQueryData(["dashboard"]) ?? null;
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

interface AppRouterProps {
  queryClient: QueryClient;
}

export const AppRouter = ({ queryClient }: AppRouterProps) => {
  const router = createAppRouter(queryClient);
  return <RouterProvider router={router} />;
};
