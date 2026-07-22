import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase'
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore'
import type {
  StoryBeatNodeData,
  CharacterNodeData,
  WorldRuleNodeData,
} from '#/features/canvas/types/canvas.types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000'

// ── Types mirroring the backend response ────────────────────────────────────

export interface AIInsight {
  id: string
  story_id: string
  node_id: string | null
  insight_type: 'continuity' | 'world_rule' | 'character' | 'plot_hole' | 'pacing'
  content: string
  status: 'unresolved' | 'resolved'
  created_at: string
}

export interface AnalyzeResponse {
  insights: AIInsight[]
  summary: string
}

export interface BrainstormSuggestion {
  title: string
  description: string
}

export interface BrainstormResponse {
  suggestions: BrainstormSuggestion[]
}

// ── Fetch existing insights for a story ─────────────────────────────────────

export function useAIInsights(storyId: string | null) {
  return useQuery<AIInsight[]>({
    queryKey: ['ai-insights', storyId],
    queryFn: async () => {
      if (!storyId) return []
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('story_id', storyId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as AIInsight[]
    },
    enabled: !!storyId,
    staleTime: 10 * 1000,
  })
}

// ── Run AI analysis via FastAPI backend ──────────────────────────────────────

export function useRunAnalysis() {
  const queryClient = useQueryClient()

  return useMutation<AnalyzeResponse, Error, string>({
    mutationFn: async (storyId: string) => {
      const { nodes, storyId: canvasStoryId } = useCanvasStore.getState()

      const sid = storyId || canvasStoryId
      if (!sid) throw new Error('No story ID available.')

      const beats = nodes
        .filter((n) => n.type === 'storyBeat')
        .map((n) => {
          const d = n.data as StoryBeatNodeData
          return {
            id: n.id,
            title: d.title,
            summary: d.summary,
            location: d.location,
            timelineOrder: d.timelineOrder,
            characterNames: d.characterNames ?? [],
          }
        })

      const characters = nodes
        .filter((n) => n.type === 'character')
        .map((n) => {
          const d = n.data as CharacterNodeData
          return { id: n.id, name: d.name, description: d.description }
        })

      const world_rules = nodes
        .filter((n) => n.type === 'worldRule')
        .map((n) => {
          const d = n.data as WorldRuleNodeData
          return { id: n.id, title: d.title, description: d.description }
        })

      const res = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: sid, beats, characters, world_rules }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail ?? 'Analysis failed.')
      }

      return res.json() as Promise<AnalyzeResponse>
    },

    onSuccess: (data, storyId) => {
      // Refresh the insights query cache
      queryClient.invalidateQueries({ queryKey: ['ai-insights', storyId] })

      // Update hasAIWarning flag on every beat node in the canvas store
      const warningNodeIds = new Set(
        data.insights
          .filter((i) => i.status === 'unresolved' && i.node_id)
          .map((i) => i.node_id as string),
      )

      const { nodes } = useCanvasStore.getState()
      nodes.forEach((node) => {
        if (node.type === 'storyBeat') {
          useCanvasStore
            .getState()
            .updateNodeData(node.id, { hasAIWarning: warningNodeIds.has(node.id) } as Partial<StoryBeatNodeData>)
        }
      })
    },
  })
}

// ── Resolve a single insight ─────────────────────────────────────────────────

export function useResolveInsight(storyId: string | null) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (insightId: string) => {
      const res = await fetch(`${BACKEND_URL}/api/insights/${insightId}/resolve`, {
        method: 'PATCH',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail ?? 'Could not resolve insight.')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights', storyId] })

      // Recompute hasAIWarning for all beats from the fresh cache
      const cachedInsights =
        (queryClient.getQueryData(['ai-insights', storyId]) as AIInsight[] | undefined) ?? []

      const warningNodeIds = new Set(
        cachedInsights
          .filter((i) => i.status === 'unresolved' && i.node_id)
          .map((i) => i.node_id as string),
      )

      const { nodes } = useCanvasStore.getState()
      nodes.forEach((node) => {
        if (node.type === 'storyBeat') {
          useCanvasStore
            .getState()
            .updateNodeData(node.id, { hasAIWarning: warningNodeIds.has(node.id) } as Partial<StoryBeatNodeData>)
        }
      })
    },
  })
}

// ── Brainstorm fixes for a single insight ────────────────────────────────────

export function useBrainstorm() {
  return useMutation<BrainstormResponse, Error, string>({
    mutationFn: async (insightContent: string) => {
      const { nodes } = useCanvasStore.getState()

      const beats = nodes
        .filter((n) => n.type === 'storyBeat')
        .map((n) => {
          const d = n.data as StoryBeatNodeData
          return {
            id: n.id,
            title: d.title,
            summary: d.summary,
            location: d.location,
            timelineOrder: d.timelineOrder,
            characterNames: d.characterNames ?? [],
          }
        })

      const characters = nodes
        .filter((n) => n.type === 'character')
        .map((n) => {
          const d = n.data as CharacterNodeData
          return { id: n.id, name: d.name, description: d.description }
        })

      const world_rules = nodes
        .filter((n) => n.type === 'worldRule')
        .map((n) => {
          const d = n.data as WorldRuleNodeData
          return { id: n.id, title: d.title, description: d.description }
        })

      const res = await fetch(`${BACKEND_URL}/api/brainstorm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insight_content: insightContent, beats, characters, world_rules }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail ?? 'Brainstorm failed.')
      }

      return res.json() as Promise<BrainstormResponse>
    },
  })
}
