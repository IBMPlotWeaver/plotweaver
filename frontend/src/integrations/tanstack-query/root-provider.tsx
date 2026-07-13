import { QueryClient } from '@tanstack/react-query'

const TWO_MINUTES = 2 * 60 * 1000
const TEN_MINUTES = 10 * 60 * 1000

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * Data is considered fresh for 2 minutes.
         * Navigating between pages within this window will NOT trigger a refetch —
         * the cached response is served immediately.
         */
        staleTime: TWO_MINUTES,
        /**
         * Unused/inactive cache entries are kept in memory for 10 minutes
         * before being garbage-collected, so returning to a page feels instant.
         */
        gcTime: TEN_MINUTES,
        /** Only retry once on failure to avoid hammering the network. */
        retry: 1,
        /** Don't refetch just because the user switched browser tabs. */
        refetchOnWindowFocus: false,
      },
    },
  })

  return {
    queryClient,
  }
}

export default function TanstackQueryProvider() {}

