import { useQuery } from '@tanstack/react-query';
import { supabase } from '#/lib/supabase';
import type { Tables } from '#/types/database.types';

export type Story = Tables<'stories'>;

export function useStory(storyId: string | undefined) {
  return useQuery({
    queryKey: ['story', storyId],
    queryFn: async () => {
      if (!storyId) {
        throw new Error('Story ID is required');
      }

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (error) {
        throw error;
      }

      return data as Story;
    },
    enabled: !!storyId,
  });
}
