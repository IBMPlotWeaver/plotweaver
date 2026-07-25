import { memo, useState } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Target, Pencil, Trash2, X, Check } from 'lucide-react';
import type { NodeProps, Node } from '@xyflow/react';
import type { GoalNodeData } from '#/features/canvas/types/canvas.types';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';

/**
 * GoalNode
 * Represents an objective for a character.
 */
export const GoalNode = memo(({ id, data, selected }: NodeProps<Node<GoalNodeData, 'goal'> >) => {
  const deleteNode = useCanvasStore(state => state.deleteNode);
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    status: data.status || '',
    obstacles: data.obstacles || '',
  });

  const saveEdit = () => {
    updateNodeData(id, { ...draft, type: 'goal' });
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({
      status: data.status || '',
      obstacles: data.obstacles || '',
    });
    setEditing(false);
  };

  return (
    <>
      <NodeResizer minWidth={288} minHeight={200} isVisible={selected} lineClassName="border-emerald-500" handleClassName="h-3 w-3 bg-white border-2 border-emerald-500 rounded-sm" />
      <div
        className={`relative w-full h-full min-w-72 max-w-96 min-h-50 flex flex-col rounded-2xl border-2 transition-all duration-200 ${selected
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/30'
          : 'border-emerald-400 dark:border-emerald-600 shadow-md'
          }`}
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.05) 0%, rgba(20, 20, 20, 0.02) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b-2 border-emerald-400 dark:border-emerald-600">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-white" />
          </div>
          {editing ? (
            <input
              autoFocus
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              className="flex-1 text-base font-semibold bg-transparent outline-none border-b border-emerald-400 text-(--sea-ink) min-w-0"
              placeholder="Goal / Status"
            />
          ) : (
            <span className="flex-1 text-base font-semibold text-(--sea-ink) truncate">
              {data.status || 'Untitled'}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 ml-auto shrink-0">
            Goal
          </span>
        </div>

        <div className="px-4 py-3 flex-1 flex flex-col min-h-0">
          {editing ? (
            <textarea
              value={draft.obstacles}
              onChange={(e) => setDraft((d) => ({ ...d, obstacles: e.target.value }))}
              className="w-full flex-1 min-h-20 text-sm bg-transparent outline-none resize-none text-(--sea-ink-soft) border border-emerald-300 dark:border-emerald-700 rounded-lg p-2 wrap-break-word"
              placeholder="Obstacles..."
            />
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
              <p className="text-sm text-(--sea-ink-soft) leading-relaxed whitespace-pre-wrap wrap-break-word">
                {data.obstacles || 'No details.'}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-1 px-3 pb-3 mt-auto">
          {editing ? (
            <>
              <button onClick={saveEdit} className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-(--surface) text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-(--sea-ink-soft) hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer">
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

GoalNode.displayName = 'GoalNode';
