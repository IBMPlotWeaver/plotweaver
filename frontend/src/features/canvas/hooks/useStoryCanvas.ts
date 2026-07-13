import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase'
import type { StoryNode, StoryEdge } from '../types'
import type { TablesInsert, TablesUpdate } from '#/types/database.types'

export function useStoryNodes(storyId: string) {
  return useQuery({
    queryKey: ['story-nodes', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_nodes')
        .select('*')
        .eq('story_id', storyId)
        .order('timeline_order', { ascending: true, nullsFirst: false })

      if (error) throw error
      return data as StoryNode[]
    },
  })
}

export function useStoryEdges(storyId: string) {
  return useQuery({
    queryKey: ['story-edges', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_edges')
        .select('*')
        .eq('story_id', storyId)

      if (error) throw error
      return data as StoryEdge[]
    },
  })
}

export function useCreateNode(storyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (node: TablesInsert<'story_nodes'>) => {
      const { data, error } = await supabase
        .from('story_nodes')
        .insert({ ...node, story_id: storyId })
        .select()
        .single()

      if (error) throw error
      return data as StoryNode
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-nodes', storyId] })
    },
  })
}

export function useUpdateNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: TablesUpdate<'story_nodes'>
    }) => {
      const { data, error } = await supabase
        .from('story_nodes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as StoryNode
    },
    onSuccess: (data) => {
      if (data.story_id) {
        queryClient.invalidateQueries({ queryKey: ['story-nodes', data.story_id] })
      }
    },
  })
}

export function useDeleteNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('story_nodes').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['story-nodes'] })
    },
  })
}

export function useCreateEdge(storyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (edge: TablesInsert<'story_edges'>) => {
      const { data, error } = await supabase
        .from('story_edges')
        .insert({ ...edge, story_id: storyId })
        .select()
        .single()

      if (error) throw error
      return data as StoryEdge
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-edges', storyId] })
    },
  })
}

export function useDeleteEdge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('story_edges').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-edges'] })
    },
  })
}
