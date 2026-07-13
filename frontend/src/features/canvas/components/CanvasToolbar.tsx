import { Film, User, Zap, ZoomIn, ZoomOut, Maximize2, Trash2 } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import type { StoryNodeType } from '#/features/canvas/types/canvas.types';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';

interface CanvasToolbarProps {
  storyTitle?: string;
}

const NODE_BUTTONS: { type: StoryNodeType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'scene',     label: 'Scene',     icon: <Film className="w-4 h-4" />,  color: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25' },
  { type: 'character', label: 'Character', icon: <User className="w-4 h-4" />,  color: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-fuchsia-500/25' },
  { type: 'event',     label: 'Event',     icon: <Zap className="w-4 h-4" />,   color: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25' },
];

/**
 * Floating toolbar for the story canvas.
 * Provides node creation, zoom, and fit-view controls.
 */
export function CanvasToolbar({ storyTitle = 'Untitled Story' }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { addNode, nodes, edges, deleteNode, selectedNodeId } = useCanvasStore();

  const handleAddNode = (type: StoryNodeType) => {
    // Place the new node near the visible center
    addNode(type, { x: 250 + Math.random() * 300, y: 100 + Math.random() * 200 });
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 flex-wrap justify-center pointer-events-auto">
      {/* Story title chip */}
      <div className="island-shell px-4 py-2 rounded-full">
        <span className="text-sm font-semibold text-[var(--sea-ink)] truncate max-w-[160px] block">{storyTitle}</span>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-[var(--line)]" />

      {/* Add node buttons */}
      <div className="island-shell flex items-center gap-1 p-1 rounded-full">
        {NODE_BUTTONS.map(({ type, label, icon, color }) => (
          <button
            key={type}
            onClick={() => handleAddNode(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shadow-md transition-all duration-150 cursor-pointer ${color}`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-[var(--line)]" />

      {/* Viewport controls */}
      <div className="island-shell flex items-center gap-1 p-1 rounded-full">
        <button onClick={() => zoomIn()} title="Zoom in" className="p-2 rounded-full text-[var(--sea-ink-soft)] hover:bg-[var(--line)] transition-colors cursor-pointer">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => zoomOut()} title="Zoom out" className="p-2 rounded-full text-[var(--sea-ink-soft)] hover:bg-[var(--line)] transition-colors cursor-pointer">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={() => fitView({ padding: 0.2 })} title="Fit view" className="p-2 rounded-full text-[var(--sea-ink-soft)] hover:bg-[var(--line)] transition-colors cursor-pointer">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Delete selected node */}
      {selectedNodeId && (
        <button
          onClick={() => deleteNode(selectedNodeId)}
          title="Delete selected node"
          className="island-shell flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      )}
    </div>
  );
}
