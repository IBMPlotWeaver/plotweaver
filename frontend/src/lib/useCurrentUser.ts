import { useQuery } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase'

/** Stable query key for the current authenticated user. */
export const CURRENT_USER_QUERY_KEY = ['currentUser'] as const

/**
 * Returns the current Supabase user from the cache.
 * Shared across Dashboard and Profile so only one request is ever made per session.
 *
 * @example
 * const { data: user } = useCurrentUser()
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
    // Auth state is stable — treat as fresh for 5 minutes.
    staleTime: 5 * 60 * 1000,
  })
}
