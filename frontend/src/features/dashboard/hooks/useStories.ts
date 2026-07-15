import { useQuery } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase'
import type { Tables } from '#/types/database.types'

export type Story = Tables<'stories'>

export function useStories(userId: string | undefined) {
  return useQuery({
    queryKey: ['stories', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        throw error
      }

      return data as Story[]
    },
    enabled: !!userId,
  })
}
