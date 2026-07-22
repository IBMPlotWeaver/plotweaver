import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '#/lib/supabase';
import { useNavigate } from '@tanstack/react-router';
import type { TablesInsert } from '#/types/database.types';

export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description?: string; userId: string }) => {
      const storyData: TablesInsert<'stories'> = {
        title: data.title,
        description: data.description || null,
        user_id: data.userId,
      };

      const { data: story, error } = await supabase
        .from('stories')
        .insert(storyData)
        .select()
        .single();

      if (error) throw error;
      return story;
    },
    onSuccess: () => {
      // Invalidate stories query to refetch
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      // Navigation is now handled by QuickCreateModal
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      // Delete story (cascade will handle related records)
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate stories query to refetch
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; title: string; description?: string }) => {
      const { data: story, error } = await supabase
        .from('stories')
        .update({
          title: data.title,
          description: data.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return story;
    },
    onSuccess: () => {
      // Invalidate stories query to refetch
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}
