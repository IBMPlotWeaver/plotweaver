import { BookOpen, User, Shield, ZoomIn, ZoomOut, Maximize2, Trash2, Save, LayoutGrid } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import type { StoryNodeType } from '#/features/canvas/types/canvas.types';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';
import { computeAutoLayout } from '#/features/canvas/utils/autoLayout';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

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

/**
 * Floating toolbar for the story canvas.
 * Provides node creation, zoom, fit-view, and save controls.
 */
export function CanvasToolbar({ storyTitle = 'Untitled Story' }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { addNode, deleteNode, selectedNodeId, saveCanvas, setNodes } = useCanvasStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleAddNode = (type: StoryNodeType) => {
    // Place the new node near the visible center
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