import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase'
import type { Tables, TablesUpdate } from '#/types/database.types'

export type Profile = Tables<'profiles'>

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
    // Profile rarely changes; cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: TablesUpdate<'profiles'>
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Profile
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] })
    },
  })
}
