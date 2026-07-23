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
      const { nodes, storyId } = useCanvasStore.getState()

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

      const res = await fetch(`${BACKEND_URL}/api/export/summaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: storyId, beats }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail ?? 'Export failed.')
      }

      return res.json() as Promise<ExportResponse>
    },
  })
}
