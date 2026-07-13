import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, Pencil, Trash2, X, Check } from 'lucide-react';
import type { NodeProps } from '@xyflow/react';
import type { StoryNodeData } from '#/features/canvas/types/canvas.types';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';

/**
 * A ReactFlow custom node representing a story character.
 */
export const CharacterNode = memo(({ id, data, selected }: NodeProps<StoryNodeData>) => {
  const { updateNodeData, deleteNode } = useCanvasStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: data.title, content: data.content });

  const saveEdit = () => {
    updateNodeData(id, draft);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({ title: data.title, content: data.content });
    setEditing(false);
  };

  return (
    <div
      className={`relative w-64 rounded-2xl border transition-all duration-200 ${
        selected
          ? 'border-fuchsia-500 shadow-lg shadow-fuchsia-500/30'
          : 'border-[var(--line)] shadow-md'
      }`}
      style={{ background: 'var(--surface)', backdropFilter: 'blur(8px)' }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !border-2 !border-fuchsia-500 !bg-[var(--surface)]" />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-[var(--line)]">
        <div className="w-7 h-7 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/40 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
        </div>
        {editing ? (
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="flex-1 text-sm font-semibold bg-transparent outline-none border-b border-fuchsia-400 text-[var(--sea-ink)] min-w-0"
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-[var(--sea-ink)] truncate">{data.title}</span>
        )}
        <span className="text-[10px] uppercase tracking-widest font-bold text-fuchsia-500 ml-auto flex-shrink-0">Character</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {editing ? (
          <textarea
            value={draft.content}
            onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
            rows={3}
            className="w-full text-xs bg-transparent outline-none resize-none text-[var(--sea-ink-soft)] border border-[var(--line)] rounded-lg p-2"
          />
        ) : (
          <p className="text-xs text-[var(--sea-ink-soft)] leading-relaxed line-clamp-3">{data.content}</p>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-1 px-3 pb-3">
        {editing ? (
          <>
            <button onClick={saveEdit} className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 hover:bg-fuchsia-200 transition-colors cursor-pointer">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-[var(--surface)] text-[var(--sea-ink-soft)] hover:bg-[var(--line)] transition-colors cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-[var(--sea-ink-soft)] hover:bg-[var(--line)] transition-colors cursor-pointer">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => deleteNode(id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !border-2 !border-fuchsia-500 !bg-[var(--surface)]" />
    </div>
  );
});

CharacterNode.displayName = 'CharacterNode';
