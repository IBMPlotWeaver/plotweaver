import { memo, useState } from 'react';
import { NodeResizer } from '@xyflow/react';
// No handles needed for WorldRule node since it floats independently
import { Shield, Pencil, Trash2, X, Check } from 'lucide-react';
import type { NodeProps, Node } from '@xyflow/react';
import type { WorldRuleNodeData } from '#/features/canvas/types/canvas.types';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';

/**
 * WorldRuleNode - Maps to world_rules table
 * Represents global constraints that govern the story universe.
 * Floats on canvas as a visual reminder of world-building rules.
 */
export const WorldRuleNode = memo(({ id, data, selected }: NodeProps<Node<WorldRuleNodeData, 'worldRule'>>) => {
  const { updateNodeData, deleteNode } = useCanvasStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: data.title,
    description: data.description,
  });

  const saveEdit = () => {
    updateNodeData(id, { ...draft, type: 'worldRule' });
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({
      title: data.title,
      description: data.description,
    });
    setEditing(false);
  };

  return (
    <>
      <NodeResizer minWidth={288} minHeight={200} isVisible={selected} lineClassName="border-violet-500" handleClassName="h-3 w-3 bg-white border-2 border-violet-500 rounded-sm" />
      <div
        className={`relative w-full h-full min-w-72 min-h-50 flex flex-col rounded-2xl border-2 transition-all duration-200 ${selected
          ? 'border-violet-500 shadow-lg shadow-violet-500/30'
          : 'border-violet-400 dark:border-violet-600 shadow-md'
          }`}
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b-2 border-violet-400 dark:border-violet-600">
          <div className="w-8 h-8 rounded-lg bg-violet-500 dark:bg-violet-600 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {editing ? (
            <input
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="flex-1 text-sm font-semibold bg-transparent outline-none border-b border-violet-400 text-(--sea-ink) min-w-0"
              placeholder="Rule Title"
            />
          ) : (
            <span className="flex-1 text-sm font-semibold text-(--sea-ink) truncate">
              {data.title}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest font-bold text-violet-600 dark:text-violet-400 ml-auto shrink-0">
            World Rule
          </span>
        </div>

        {/* Body - Constraint Description */}
        <div className="px-4 py-3 flex-1 flex flex-col min-h-0">
          {editing ? (
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className="w-full flex-1 min-h-20 text-xs bg-transparent outline-none resize-none text-(--sea-ink-soft) border border-violet-300 dark:border-violet-700 rounded-lg p-2 wrap-break-word"
              placeholder="Describe the constraint or rule that governs this world..."
            />
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
              <p className="text-xs text-(--sea-ink-soft) leading-relaxed whitespace-pre-wrap wrap-break-word">
                {data.description}
              </p>
            </div>
          )}
        </div>

        {/* Info Badge */}
        <div className="px-4 pb-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[10px] font-medium">
            <Shield className="w-3 h-3" />
            <span>Applies to entire story universe</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-end gap-1 px-3 pb-3 mt-auto">
          {editing ? (
            <>
              <button
                onClick={saveEdit}
                className="p-1.5 rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1.5 rounded-lg bg-(--surface) text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg text-(--sea-ink-soft) hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteNode(id)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
});

WorldRuleNode.displayName = 'WorldRuleNode';
