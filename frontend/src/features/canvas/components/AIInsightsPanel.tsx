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
  Wand2,
  X,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/features/shadcn/components/ui/sheet'
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore'
import { useAIInsights, useRunAnalysis, useResolveInsight, useBrainstorm } from '#/features/canvas/hooks/useAIAnalysis'
import type { AIInsight, BrainstormSuggestion } from '#/features/canvas/hooks/useAIAnalysis'

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
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    borderColor: 'border-sky-200 dark:border-sky-800',
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
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
  },
}

// ── Insight card ─────────────────────────────────────────────────────────────

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

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<BrainstormSuggestion[]>([])
  const { mutate: brainstorm, isPending: isBrainstorming, error: brainstormError } = useBrainstorm()

  const handleBrainstorm = () => {
    // If we already have suggestions cached, just toggle visibility — no new request
    if (suggestions.length > 0) {
      setShowSuggestions((v) => !v)
      return
    }
    brainstorm(insight.content, {
      onSuccess: (data) => {
        setSuggestions(data.suggestions)
        setShowSuggestions(true)
      },
    })
  }

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
        <div className={`text-xs text-(--sea-ink) leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {insight.content}
        </div>

        {/* Expand / collapse long content */}
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

        {/* Brainstorm suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2 border-t border-(--line) pt-2">
            <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wide">AI Suggestions</p>
            {suggestions.map((s, i) => (
              <div key={i} className="rounded-lg bg-violet-50 dark:bg-violet-900/20 p-2">
                <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">{s.title}</p>
                <p className="text-[11px] text-(--sea-ink-soft) leading-relaxed mt-0.5">{s.description}</p>
              </div>
            ))}
          </div>
        )}

        {brainstormError && (
          <p className="text-[11px] text-rose-500 mt-1">{brainstormError.message}</p>
        )}

        {/* Actions */}
        {!resolved && (
          <div className="flex items-center gap-1 mt-3 self-end">
            <button
              onClick={handleBrainstorm}
              disabled={isBrainstorming}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isBrainstorming ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : showSuggestions && suggestions.length > 0 ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
              {isBrainstorming ? 'Thinking…' : showSuggestions && suggestions.length > 0 ? 'Hide' : 'Brainstorm'}
            </button>
            <button
              onClick={() => onResolve(insight.id)}
              disabled={isResolving}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isResolving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              Mark resolved
            </button>
          </div>
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
  // tracks whether analysis has been run at least once this session
  const [hasRun, setHasRun] = useState(false)

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

  // Results exist if fetched from DB or returned from a run this session
  const hasResults = insights.length > 0 || hasRun

  const handleRunAnalysis = () => {
    if (!storyId) return
    runAnalysis(storyId, { onSuccess: () => setHasRun(true) })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Action area — full CTA before first run, compact re-run after */}
      {!hasResults ? (
        <div className="px-4 py-3 border-b border-(--line) shrink-0">
          <button
            onClick={handleRunAnalysis}
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
          {analysisError && !isAnalysing && (
            <p className="mt-2 text-xs text-center text-rose-500">{analysisError.message}</p>
          )}
        </div>
      ) : (
        <div className="px-4 py-2 border-b border-(--line) shrink-0 flex items-center justify-between">
          {lastResult && !isAnalysing ? (
            <p className="text-[11px] text-(--sea-ink-soft) truncate max-w-[160px]">{lastResult.summary}</p>
          ) : (
            <span />
          )}
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalysing || !storyId}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isAnalysing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {isAnalysing ? 'Analysing…' : 'Re-run'}
          </button>
        </div>
      )}

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
              <p className="text-xs text-(--sea-ink-soft)">Loading insights...</p>
            </div>
          </div>
        )}

        {!insightsLoading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 pt-12 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-violet-500" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-(--sea-ink)">
                {hasResults ? 'No issues found' : 'Ready to analyse'}
              </p>
              <p className="text-xs text-(--sea-ink-soft) leading-relaxed max-w-56">
                {hasResults
                  ? 'Your story looks clean. Use Re-run to check again after making changes.'
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
            className="island-shell flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) hover:bg-(--line) transition-colors cursor-pointer"
            title="AI Insights"
          >
            <BrainCircuit className="w-4 h-4 text-violet-500" />
            <span className="hidden sm:inline">AI Review</span>
            {unresolvedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                {unresolvedCount}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-96 p-0 flex flex-col island-shell border-l border-(--line)">
          <SheetHeader className="px-4 py-4 border-b border-(--line) shrink-0">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-violet-500 shrink-0" />
              <SheetTitle className="flex-1 text-sm font-semibold text-(--sea-ink)">AI Review</SheetTitle>
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
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <AIInsightsSidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </Panel>
  )
}
