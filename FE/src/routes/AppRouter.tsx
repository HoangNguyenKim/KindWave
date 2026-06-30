import { QueryClient } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: "/",
      errorElement: <div>An unexpected error occurred</div>,
      children: [
        {
          path: "login",
          lazy: async () => {
            const { LoginRoute } = await import("@/features/authentication");
            return { Component: LoginRoute };
          },
        },
        {
          element: <ProtectedRoute allowedRoles={["USER", "ADMIN"]} />,
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
  ]);

interface AppRouterProps {
  queryClient: QueryClient;
}

export const AppRouter = ({ queryClient }: AppRouterProps) => {
  const router = createAppRouter(queryClient);
  return <RouterProvider router={router} />;
};
