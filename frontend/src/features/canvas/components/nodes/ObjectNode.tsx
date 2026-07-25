import { memo, useState } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Box, Pencil, Trash2, X, Check } from 'lucide-react';
import type { NodeProps, Node } from '@xyflow/react';
import type { ObjectNodeData } from '#/features/canvas/types/canvas.types';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';

/**
 * ObjectNode
 * Represents a significant item or artifact.
 */
export const ObjectNode = memo(({ id, data, selected }: NodeProps<Node<ObjectNodeData, 'object'> >) => {
  const deleteNode = useCanvasStore(state => state.deleteNode);
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: data.name || '',
    significance: data.significance || '',
  });

  const saveEdit = () => {
    updateNodeData(id, { ...draft, type: 'object' });
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({
      name: data.name || '',
      significance: data.significance || '',
    });
    setEditing(false);
  };

  return (
    <>
      <NodeResizer minWidth={288} minHeight={200} isVisible={selected} lineClassName="border-amber-500" handleClassName="h-3 w-3 bg-white border-2 border-amber-500 rounded-sm" />
      <div
        className={`relative w-full h-full min-w-72 max-w-96 min-h-50 flex flex-col rounded-2xl border-2 transition-all duration-200 ${selected
          ? 'border-amber-500 shadow-lg shadow-amber-500/30'
          : 'border-amber-400 dark:border-amber-600 shadow-md'
          }`}
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.05) 0%, rgba(20, 20, 20, 0.02) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b-2 border-amber-400 dark:border-amber-600">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Box className="w-4 h-4 text-white" />
          </div>
          {editing ? (
            <input
              autoFocus
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="flex-1 text-base font-semibold bg-transparent outline-none border-b border-amber-400 text-(--sea-ink) min-w-0"
              placeholder="Object Name"
            />
          ) : (
            <span className="flex-1 text-base font-semibold text-(--sea-ink) truncate">
              {data.name || 'Untitled'}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 ml-auto shrink-0">
            Object
          </span>
        </div>

        <div className="px-4 py-3 flex-1 flex flex-col min-h-0">
          {editing ? (
            <textarea
              value={draft.significance}
              onChange={(e) => setDraft((d) => ({ ...d, significance: e.target.value }))}
              className="w-full flex-1 min-h-20 text-sm bg-transparent outline-none resize-none text-(--sea-ink-soft) border border-amber-300 dark:border-amber-700 rounded-lg p-2 wrap-break-word"
              placeholder="Why is this important?..."
            />
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
              <p className="text-sm text-(--sea-ink-soft) leading-relaxed whitespace-pre-wrap wrap-break-word">
                {data.significance || 'No details.'}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-1 px-3 pb-3 mt-auto">
          {editing ? (
            <>
              <button onClick={saveEdit} className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-(--surface) text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-(--sea-ink-soft) hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deleteNode(id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
});

ObjectNode.displayName = 'ObjectNode';
