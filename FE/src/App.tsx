import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/react-query";
import { AppRouter } from "@/routes/AppRouter";

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter queryClient={queryClient} />
    </QueryClientProvider>
  );
};
