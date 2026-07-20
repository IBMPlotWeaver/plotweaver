import { useState } from 'react'
import { Panel } from '@xyflow/react'
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  BookOpen,
  Globe,
  User,
  Lightbulb,
  Activity,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/features/shadcn/components/ui/sheet'
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore'
import { useAIInsights, useRunAnalysis, useResolveInsight } from '#/features/canvas/hooks/useAIAnalysis'
import type { AIInsight } from '#/features/canvas/hooks/useAIAnalysis'

// ── Insight type metadata ────────────────────────────────────────────────────

const TYPE_META: Record<
  AIInsight['insight_type'],
  { label: string; icon: React.ReactNode; color: string; bg: string; borderColor: string }
> = {
  continuity: {
    label: 'Continuity',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  world_rule: {
    label: 'World Rule',
    icon: <Globe className="w-3.5 h-3.5" />,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  character: {
    label: 'Character',
    icon: <User className="w-3.5 h-3.5" />,
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
  },
  plot_hole: {
    label: 'Plot Hole',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
  },
  pacing: {
    label: 'Pacing',
    icon: <Activity className="w-3.5 h-3.5" />,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    borderColor: 'border-sky-200 dark:border-sky-800',
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
  const [expanded, setExpanded] = useState(false)
  const meta = TYPE_META[insight.insight_type] ?? TYPE_META.continuity
  const resolved = insight.status === 'resolved'

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${resolved
        ? 'opacity-60 border-(--line) bg-(--surface)'
        : `${meta.borderColor} ${meta.bg} hover:shadow-md`
        }`}
    >
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${meta.bg} ${meta.color} border ${meta.borderColor}`}>
          {meta.icon}
          {meta.label}
        </span>
        {beatTitle && (
          <span className="flex items-center gap-1 text-[10px] text-(--sea-ink-soft) ml-auto truncate">
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-32">{beatTitle}</span>
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        <div className={`text-sm text-(--sea-ink) leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {insight.content}
        </div>

        {insight.content.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[11px] font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show more
              </>
            )}
          </button>
        )}

        {/* Action */}
        {!resolved && (
          <button
            onClick={() => onResolve(insight.id)}
            disabled={isResolving}
            className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResolving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark as Resolved
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Sidebar content component ─────────────────────────────────────────────────

function AIInsightsSidebarContent() {
  const storyId = useCanvasStore((s) => s.storyId)
  const nodes = useCanvasStore((s) => s.nodes)
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Run analysis section */}
      <div className="px-4 py-4 border-b border-(--line) shrink-0 space-y-3">
        <button
          onClick={() => storyId && runAnalysis(storyId)}
          disabled={isAnalysing || !storyId}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all cursor-pointer shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40"
        >
          {isAnalysing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with Granite AI...
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
          <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
            <p className="text-sm text-violet-700 dark:text-violet-300 leading-relaxed">
              {lastResult.summary}
            </p>
          </div>
        )}
        {analysisError && !isAnalysing && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
              {analysisError.message}
            </p>
          </div>
        )}
      </div>

      {/* Toggle resolved */}
      {resolvedInsights.length > 0 && (
        <div className="px-4 pt-3 pb-2 shrink-0">
          <button
            onClick={() => setShowResolved((v) => !v)}
            className="flex items-center gap-2 text-[11px] font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors cursor-pointer"
          >
            {showResolved ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Hide resolved ({resolvedInsights.length})
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show resolved ({resolvedInsights.length})
              </>
            )}
          </button>
        </div>
      )}

      {/* Insights list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
        {insightsLoading && (
          <div className="flex justify-center pt-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
              <p className="text-sm text-(--sea-ink-soft)">Loading insights...</p>
            </div>
          </div>
        )}

        {!insightsLoading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 pt-12 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-violet-500" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-(--sea-ink)">
                {unresolvedInsights.length === 0 && resolvedInsights.length > 0
                  ? 'All issues resolved! 🎉'
                  : 'No issues found'}
              </p>
              <p className="text-sm text-(--sea-ink-soft) leading-relaxed max-w-56">
                {unresolvedInsights.length === 0 && resolvedInsights.length > 0
                  ? 'Great work! Your story is looking solid.'
                  : 'Run the AI analysis to check your story for continuity issues, world-rule violations, and plot holes.'}
              </p>
            </div>
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
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function AIInsightsPanel() {
  const storyId = useCanvasStore((s) => s.storyId)
  const [open, setOpen] = useState(false)

  const { data: insights = [] } = useAIInsights(storyId)
  const unresolvedCount = insights.filter((i) => i.status === 'unresolved').length

  return (
    <Panel position="top-right" className="mt-4 mr-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className={`island-shell flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold transition-all cursor-pointer shadow-lg ${unresolvedCount > 0
              ? 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20'
              : 'text-(--sea-ink-soft) hover:text-(--sea-ink)'
              }`}
          >
            <BrainCircuit className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">AI Review</span>
            {unresolvedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {unresolvedCount > 9 ? '9+' : unresolvedCount}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0 border-(--line) bg-(--surface) flex flex-col">
          <SheetHeader className="px-4 pt-5 pb-3 border-b border-(--line)">
            <SheetTitle className="flex items-center gap-2 text-lg text-(--sea-ink)">
              <BrainCircuit className="w-5 h-5 text-violet-500" />
              AI Review
              {unresolvedCount > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                  {unresolvedCount}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <AIInsightsSidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </Panel>
  )
}