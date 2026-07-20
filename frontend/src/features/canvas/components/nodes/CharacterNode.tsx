import { memo, useState } from 'react';
import { NodeResizer } from '@xyflow/react';
import { User, Pencil, Trash2, X, Check } from 'lucide-react';
import type { NodeProps, Node } from '@xyflow/react';
import type { CharacterNodeData } from '#/features/canvas/types/canvas.types';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';

/**
 * CharacterNode - Maps to characters table
 * Represents a character entity that can be placed on the canvas.
 * Creates a "murder board" style layout where characters can be visually connected to story beats.
 */
export const CharacterNode = memo(({ id, data, selected }: NodeProps<Node<CharacterNodeData, 'character'>>) => {
  const deleteNode = useCanvasStore(state => state.deleteNode);
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: data.name,
    description: data.description || '',
  });

  const saveEdit = () => {
    updateNodeData(id, { ...draft, type: 'character' });
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({
      name: data.name,
      description: data.description || '',
    });
    setEditing(false);
  };

  const role = data.role || 'Char';

  return (
    <>
      <NodeResizer minWidth={256} minHeight={200} isVisible={selected} lineClassName="border-fuchsia-500" handleClassName="h-3 w-3 bg-white border-2 border-fuchsia-500 rounded-sm" />
      <div
        className={`relative w-full h-full min-w-64 max-w-96 min-h-50 flex flex-col rounded-2xl border transition-all duration-200 ${selected
          ? 'border-fuchsia-500 shadow-lg shadow-fuchsia-500/30'
          : 'border-(--line) shadow-md'
          }`}
        style={{ background: 'var(--surface)', backdropFilter: 'blur(8px)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-(--line)">
          <div className="w-8 h-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/40 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          {editing ? (
            <input
              autoFocus
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="flex-1 text-sm font-semibold bg-transparent outline-none border-b border-fuchsia-400 text-(--sea-ink) min-w-0"
              placeholder="Character Name"
            />
          ) : (
            <span className="flex-1 text-sm font-semibold text-(--sea-ink) truncate">
              {data.name}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest font-bold text-fuchsia-500 ml-auto shrink-0">
            {role}
          </span>
        </div>

        {/* Body - Bio/Description */}
        <div className="px-4 py-3 flex-1 flex flex-col min-h-0">
          {editing ? (
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className="w-full flex-1 min-h-20 text-xs bg-transparent outline-none resize-none text-(--sea-ink-soft) border border-(--line) rounded-lg p-2 wrap-break-word"
              placeholder="Describe this character's background, personality, and role..."
            />
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
              <p className="text-xs text-(--sea-ink-soft) leading-relaxed whitespace-pre-wrap wrap-break-word">
                {data.description || 'No description yet...'}
              </p>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-end gap-1 px-3 pb-3">
          {editing ? (
            <>
              <button
                onClick={saveEdit}
                className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 hover:bg-fuchsia-200 transition-colors cursor-pointer"
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
                className="p-1.5 rounded-lg text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
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

CharacterNode.displayName = 'CharacterNode';