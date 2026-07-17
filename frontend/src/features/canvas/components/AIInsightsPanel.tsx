import { useState } from 'react'
import { Panel } from '@xyflow/react'
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  X,
  Loader2,
  BookOpen,
  Globe,
  User,
  Lightbulb,
  Activity,
  BrainCircuit,
} from 'lucide-react'
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore'
import { useAIInsights, useRunAnalysis, useResolveInsight } from '#/features/canvas/hooks/useAIAnalysis'
import type { AIInsight } from '#/features/canvas/hooks/useAIAnalysis'

// ── Insight type metadata ────────────────────────────────────────────────────

const TYPE_META: Record<
  AIInsight['insight_type'],
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  continuity: {
    label: 'Continuity',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  world_rule: {
    label: 'World Rule',
    icon: <Globe className="w-3.5 h-3.5" />,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/40',
  },
  character: {
    label: 'Character',
    icon: <User className="w-3.5 h-3.5" />,
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40',
  },
  plot_hole: {
    label: 'Plot Hole',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
  },
  pacing: {
    label: 'Pacing',
    icon: <Activity className="w-3.5 h-3.5" />,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-100 dark:bg-sky-900/40',
  },
}

// ── Single insight card ───────────────────────────────────────────────────────

function InsightCard({
  insight,
  beatTitle,
  onResolve,
  isResolving,
}: {
  insight: AIInsight
  beatTitle: string | null
  onResolve: (id: string) => void
  isResolving: boolean
}) {
  const meta = TYPE_META[insight.insight_type] ?? TYPE_META.continuity
  const resolved = insight.status === 'resolved'

  return (
    <div
      className={`rounded-xl border p-3 flex flex-col gap-2 transition-all ${
        resolved
          ? 'opacity-50 border-(--line)'
          : 'border-(--line) hover:border-violet-300 dark:hover:border-violet-700'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.bg} ${meta.color}`}>
          {meta.icon}
          {meta.label}
        </span>
        {beatTitle && (
          <span className="flex items-center gap-1 text-[10px] text-(--sea-ink-soft) ml-auto truncate">
            <ChevronRight className="w-3 h-3 shrink-0" />
            {beatTitle}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-xs text-(--sea-ink) leading-relaxed">{insight.content}</p>

      {/* Action */}
      {!resolved && (
        <button
          onClick={() => onResolve(insight.id)}
          disabled={isResolving}
          className="self-end flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isResolving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
          Mark resolved
        </button>
      )}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function AIInsightsPanel() {
  const storyId = useCanvasStore((s) => s.storyId)
  const nodes = useCanvasStore((s) => s.nodes)
  const [open, setOpen] = useState(false)
  const [showResolved, setShowResolved] = useState(false)

  const { data: insights = [], isLoading: insightsLoading } = useAIInsights(storyId)
  const { mutate: runAnalysis, isPending: isAnalysing, data: lastResult, error: analysisError } = useRunAnalysis()
  const { mutate: resolveInsight, isPending: isResolving, variables: resolvingId } = useResolveInsight(storyId)

  // Build beat id → title lookup
  const beatTitleMap = new Map(
    nodes
      .filter((n) => n.type === 'storyBeat')
      .map((n) => [n.id, (n.data as { title: string }).title]),
  )

  const unresolvedInsights = insights.filter((i) => i.status === 'unresolved')
  const resolvedInsights = insights.filter((i) => i.status === 'resolved')
  const displayed = showResolved ? insights : unresolvedInsights

  const unresolvedCount = unresolvedInsights.length

  return (
    <Panel position="top-right" className="m-0! p-0! top-0 bottom-0 h-full flex items-start justify-end pointer-events-none">
      <div className="pointer-events-auto flex items-start h-full">
        {/* Slide-in panel */}
        <div
          className={`island-shell h-screen flex flex-col rounded-none rounded-l-2xl border-r-0 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
            open ? 'w-80' : 'w-0'
          }`}
        >
          {open && (
            <>
              {/* Panel header */}
              <div className="flex items-center gap-2 px-4 py-4 border-b border-(--line) shrink-0">
                <BrainCircuit className="w-4 h-4 text-violet-500 shrink-0" />
                <span className="flex-1 text-sm font-semibold text-(--sea-ink)">AI Review</span>
                {unresolvedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                    {unresolvedCount}
                  </span>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Run analysis button */}
              <div className="px-4 py-3 border-b border-(--line) shrink-0">
                <button
                  onClick={() => storyId && runAnalysis(storyId)}
                  disabled={isAnalysing || !storyId}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors cursor-pointer shadow-md shadow-violet-500/20"
                >
                  {isAnalysing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analysing with Granite…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run AI Analysis
                    </>
                  )}
                </button>

                {/* Last result summary */}
                {lastResult && !isAnalysing && (
                  <p className="mt-2 text-xs text-center text-(--sea-ink-soft)">
                    {lastResult.summary}
                  </p>
                )}
                {analysisError && !isAnalysing && (
                  <p className="mt-2 text-xs text-center text-rose-500">
                    {analysisError.message}
                  </p>
                )}
              </div>

              {/* Toggle resolved */}
              {resolvedInsights.length > 0 && (
                <div className="px-4 pt-3 shrink-0">
                  <button
                    onClick={() => setShowResolved((v) => !v)}
                    className="text-[11px] text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors cursor-pointer"
                  >
                    {showResolved ? 'Hide resolved' : `Show resolved (${resolvedInsights.length})`}
                  </button>
                </div>
              )}

              {/* Insights list */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 custom-scrollbar">
                {insightsLoading && (
                  <div className="flex justify-center pt-8">
                    <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                  </div>
                )}

                {!insightsLoading && displayed.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 pt-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-violet-500" />
                    </div>
                    <p className="text-sm font-medium text-(--sea-ink)">No issues found</p>
                    <p className="text-xs text-(--sea-ink-soft) leading-relaxed max-w-52">
                      Run the AI analysis to check your story for continuity issues, world-rule violations, and plot holes.
                    </p>
                  </div>
                )}

                {displayed.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    beatTitle={insight.node_id ? (beatTitleMap.get(insight.node_id) ?? null) : null}
                    onResolve={resolveInsight}
                    isResolving={isResolving && resolvingId === insight.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Toggle button — always visible */}
        <button
          onClick={() => setOpen((v) => !v)}
          title={open ? 'Close AI Review' : 'Open AI Review'}
          className={`island-shell mt-4 flex items-center gap-2 px-3 py-2.5 rounded-l-2xl rounded-r-none text-sm font-medium transition-all cursor-pointer shadow-lg ${
            unresolvedCount > 0
              ? 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              : 'text-(--sea-ink-soft) hover:text-(--sea-ink)'
          }`}
        >
          <BrainCircuit className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">AI Review</span>
          {unresolvedCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {unresolvedCount > 9 ? '9+' : unresolvedCount}
            </span>
          )}
        </button>
      </div>
    </Panel>
  )
}
