import { useMutation } from '@tanstack/react-query'
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore'
import type { StoryBeatNodeData } from '#/features/canvas/types/canvas.types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000'

export interface ChapterSummary {
  beat_id: string
  timeline_order: number
  title: string
  summary: string
}

export interface ExportResponse {
  chapters: ChapterSummary[]
  outline: string
}

// ── Generate AI chapter summaries and export outline ─────────────────────────

export function useExportSummaries() {
  return useMutation<ExportResponse, Error, void>({
    mutationFn: async () => {
      const { nodes, edges, storyId } = useCanvasStore.getState()

      if (!storyId) throw new Error('No story ID available.')

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

      if (beats.length === 0) throw new Error('Add some story beats before exporting.')

      const characters = nodes.filter((n) => n.type === 'character').map((n) => ({ id: n.id, ...n.data }))
      const world_rules = nodes.filter((n) => n.type === 'worldRule').map((n) => ({ id: n.id, ...n.data }))
      const locations = nodes.filter((n) => n.type === 'location').map((n) => ({ id: n.id, ...n.data }))
      const objects = nodes.filter((n) => n.type === 'object').map((n) => ({ id: n.id, ...n.data }))
      const events = nodes.filter((n) => n.type === 'event').map((n) => ({ id: n.id, ...n.data }))
      const conflicts = nodes.filter((n) => n.type === 'conflict').map((n) => ({ id: n.id, ...n.data }))
      const goals = nodes.filter((n) => n.type === 'goal').map((n) => ({ id: n.id, ...n.data }))
      const secrets = nodes.filter((n) => n.type === 'secret').map((n) => ({ id: n.id, ...n.data }))
      const threads = nodes.filter((n) => n.type === 'thread').map((n) => ({ id: n.id, ...n.data }))
      const relationships = edges
        .filter((e) => e.data?.type === 'relationship')
        .map((e) => ({
          id: e.id,
          source_character_id: e.source,
          target_character_id: e.target,
          ...e.data,
        }))

      const payload = {
        story_id: storyId,
        beats,
        characters,
        world_rules,
        locations,
        objects,
        events,
        conflicts,
        goals,
        secrets,
        threads,
        relationships,
      }

      const res = await fetch(`${BACKEND_URL}/api/export/summaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail ?? 'Export failed.')
      }

      return res.json() as Promise<ExportResponse>
    },
  })
}
