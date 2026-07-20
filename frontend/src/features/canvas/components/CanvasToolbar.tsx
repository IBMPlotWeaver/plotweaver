import { BookOpen, User, Shield, ZoomIn, ZoomOut, Maximize2, Trash2, Save, LayoutGrid, Moon, Sun, FileDown, X, Loader2, Copy, Check } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import type { StoryNodeType } from '#/features/canvas/types/canvas.types';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';
import { useThemeStore } from '#/features/store/useThemeStore';
import { computeAutoLayout } from '#/features/canvas/utils/autoLayout';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useExportSummaries } from '#/features/canvas/hooks/useExport';
import type { ChapterSummary } from '#/features/canvas/hooks/useExport';

interface CanvasToolbarProps {
  storyTitle?: string;
}

const NODE_BUTTONS: { type: StoryNodeType; label: string; icon: React.ReactNode; color: string }[] = [
  {
    type: 'storyBeat',
    label: 'Story Beat',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25'
  },
  {
    type: 'character',
    label: 'Character',
    icon: <User className="w-4 h-4" />,
    color: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-fuchsia-500/25'
  },
  {
    type: 'worldRule',
    label: 'World Rule',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-violet-500 hover:bg-violet-600 text-white shadow-violet-500/25'
  },
];

// ── Export modal ─────────────────────────────────────────────────────────────

function ExportModal({
  chapters,
  outline,
  onClose,
}: {
  chapters: ChapterSummary[]
  outline: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(outline)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([outline], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'story-outline.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="island-shell w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-(--line) shrink-0">
          <FileDown className="w-4 h-4 text-violet-500" />
          <span className="flex-1 text-sm font-semibold text-(--sea-ink)">Story Outline Export</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chapter list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
          {chapters.map((ch) => (
            <div key={ch.beat_id} className="flex flex-col gap-1">
              <p className="text-xs font-bold text-(--sea-ink)">
                Chapter {ch.timeline_order}: {ch.title}
              </p>
              <p className="text-xs text-(--sea-ink-soft) leading-relaxed">{ch.summary}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-(--line) shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-(--sea-ink) hover:bg-(--line) transition-colors cursor-pointer border border-(--line)"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy text'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer shadow-md shadow-violet-500/20"
          >
            <FileDown className="w-4 h-4" />
            Download .txt
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

/**
 * Floating toolbar for the story canvas.
 * Provides node creation, zoom, fit-view, save, theme toggle, and export controls.
 */
export function CanvasToolbar({ storyTitle = 'Untitled Story' }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const addNode = useCanvasStore(state => state.addNode)
  const deleteNode = useCanvasStore(state => state.deleteNode)
  const selectedNodeId = useCanvasStore(state => state.selectedNodeId)
  const saveCanvas = useCanvasStore(state => state.saveCanvas)
  const setNodes = useCanvasStore(state => state.setNodes)
  const { theme, toggleTheme } = useThemeStore();
  const [isSaving, setIsSaving] = useState(false);
  const [exportData, setExportData] = useState<{ chapters: ChapterSummary[]; outline: string } | null>(null)

  const { mutate: exportSummaries, isPending: isExporting } = useExportSummaries()

  const handleAddNode = (type: StoryNodeType) => {
    addNode(type, { x: 250 + Math.random() * 300, y: 100 + Math.random() * 200 });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCanvas();
    } catch (error) {
      console.error('Failed to save canvas:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoLayout = () => {
    const { nodes, edges } = useCanvasStore.getState();
    const laid = computeAutoLayout(nodes, edges);
    setNodes(laid);
    setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50);
  };

  const handleExport = () => {
    exportSummaries(undefined, {
      onSuccess: (data) => setExportData(data),
    })
  }

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 flex-wrap justify-center pointer-events-auto">
        {/* Back to Dashboard */}
        <Link
          to="/dashboard"
          className="island-shell flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) hover:bg-(--line) transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {/* Story title chip */}
        <div className="island-shell px-4 py-2 rounded-full flex items-center">
          <span className="text-sm font-semibold text-(--sea-ink) truncate max-w-40 block">
            {storyTitle}
          </span>
          {useCanvasStore((state) => state.hasUnsavedChanges) && (
            <div className="w-2 h-2 ml-2 rounded-full bg-fuchsia-500 animate-pulse" title="Unsaved changes" />
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-(--line)" />

        {/* Add node buttons */}
        <div className="island-shell flex items-center gap-1 p-1 rounded-full">
          {NODE_BUTTONS.map(({ type, label, icon, color }) => (
            <button
              key={type}
              onClick={() => handleAddNode(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shadow-md transition-all duration-150 cursor-pointer ${color}`}
              title={`Add ${label}`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-(--line)" />

        {/* Viewport controls */}
        <div className="island-shell flex items-center gap-1 p-1 rounded-full">
          <button
            onClick={() => zoomIn()}
            title="Zoom in"
            className="p-2 rounded-full text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoomOut()}
            title="Zoom out"
            className="p-2 rounded-full text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => fitView({ padding: 0.2 })}
            title="Fit view"
            className="p-2 rounded-full text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleAutoLayout}
            title="Auto-layout nodes"
            className="p-2 rounded-full text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-(--line)" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="island-shell p-2 rounded-full text-(--sea-ink-soft) hover:bg-(--line) hover:text-(--sea-ink) transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-(--line)" />

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="island-shell flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-(--sea-ink) hover:bg-(--line) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save canvas"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
        </button>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="island-shell flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-violet-200 dark:border-violet-800"
          title="Export story outline"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{isExporting ? 'Generating…' : 'Export'}</span>
        </button>

        {/* Delete selected node */}
        {selectedNodeId && (
          <>
            <div className="h-8 w-px bg-(--line)" />
            <button
              onClick={() => deleteNode(selectedNodeId)}
              title="Delete selected node"
              className="island-shell flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </>
        )}
      </div>

      {/* Export modal */}
      {exportData && (
        <ExportModal
          chapters={exportData.chapters}
          outline={exportData.outline}
          onClose={() => setExportData(null)}
        />
      )}
    </>
  );
}
