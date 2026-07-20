import { ZoomIn, ZoomOut } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

/**
 * Floating zoom controls positioned at the bottom of the canvas.
 * Provides zoom in and zoom out functionality.
 */
export function ZoomControls() {
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
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
      </div>
    </div>
  );
}
