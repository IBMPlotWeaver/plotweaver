import { ZoomIn, ZoomOut, Maximize2, Trash2, Save, LayoutGrid, Moon, Sun } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';
import { useThemeStore } from '#/features/store/useThemeStore';
import { computeAutoLayout } from '#/features/canvas/utils/autoLayout';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

interface CanvasToolbarProps {
  storyTitle?: string;
}

/**
 * Floating toolbar for the story canvas.
 * Provides node creation, zoom, fit-view, and save controls.
 */
export function CanvasToolbar({ storyTitle = 'Untitled Story' }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const deleteNode = useCanvasStore(state => state.deleteNode)
  const selectedNodeId = useCanvasStore(state => state.selectedNodeId)
  const saveCanvas = useCanvasStore(state => state.saveCanvas)
  const setNodes = useCanvasStore(state => state.setNodes)
  const { theme, toggleTheme } = useThemeStore();
  const [isSaving, setIsSaving] = useState(false);

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

  return (
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
  );
}