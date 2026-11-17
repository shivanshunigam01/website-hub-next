import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

/** One QueryClient per RSC request (safe to dehydrate into the client tree). */
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          gcTime: 5 * 60_000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    }),
);
