import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { BookOpen, Pencil, Trash2, X, Check, MapPin, Users, AlertCircle } from 'lucide-react';
import type { NodeProps, Node } from '@xyflow/react';
import type { StoryBeatNodeData } from '#/features/canvas/types/canvas.types';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';

/**
 * StoryBeatNode - Maps to story_nodes table
 * Represents a scene, chapter outline, or specific turning point in the timeline.
 */
export const StoryBeatNode = memo(({ id, data, selected }: NodeProps<Node<StoryBeatNodeData, 'storyBeat'>>) => {
  const deleteNode = useCanvasStore(state => state.deleteNode);
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: data.title,
    summary: data.summary || '',
    location: data.location || '',
  });

  const saveEdit = () => {
    updateNodeData(id, { ...draft, type: 'storyBeat' });
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({
      title: data.title,
      summary: data.summary || '',
      location: data.location || '',
    });
    setEditing(false);
  };

  const hasAIWarning = data.hasAIWarning || false;
  const timelineOrder = data.timelineOrder ?? 0;

  // Dynamically extract mentioned characters from text with smart partial matching
  const { nodes } = useCanvasStore();
  const textToScan = (editing ? `${draft.title} ${draft.summary}` : `${data.title} ${data.summary}`).toLowerCase();

  const characterNames = Array.from(new Set(
    nodes
      .filter(n => n.type === 'character')
      .map(char => char.data as import('#/features/canvas/types/canvas.types').CharacterNodeData)
      .filter(charData => {
        if (!charData.name) return false;
        const fullName = charData.name.toLowerCase();
        
        // Check for exact full name match
        if (textToScan.includes(`@${fullName}`)) return true;
        
        // Check for partial matches (any word in the full name)
        const nameParts = fullName.split(/\s+/);
        return nameParts.some(part => 
          part.length > 2 && textToScan.includes(`@${part}`)
        );
      })
      .map(charData => charData.name)
  ));

  return (
    <>
      <NodeResizer minWidth={320} minHeight={220} isVisible={selected} lineClassName="border-violet-500" handleClassName="h-3 w-3 bg-white border-2 border-violet-500 rounded-sm" />
      <div
        className={`relative w-full h-full min-w-80 max-w-120 min-h-55 flex flex-col rounded-2xl border transition-all duration-200 ${selected
          ? 'border-violet-500 shadow-lg shadow-violet-500/30'
          : 'border-(--line) shadow-md'
          }`}
        style={{ background: 'var(--surface)', backdropFilter: 'blur(8px)' }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-!3 border-2! border-violet-500! bg-(--surface)!"
        />

        {/* Header with Timeline Badge */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-(--line)">
          <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          {editing ? (
            <input
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="flex-1 text-base font-semibold bg-transparent outline-none border-b border-violet-400 text-(--sea-ink) min-w-0"
              placeholder="Beat Title"
            />
          ) : (
            <span className="flex-1 text-base font-semibold text-(--sea-ink) truncate">
              {data.title}
            </span>
          )}

          {/* Timeline Order Badge */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {hasAIWarning && (
              <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center animate-pulse">
                <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              </div>
            )}
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
              #{timelineOrder}
            </span>
          </div>
        </div>

        {/* Body - Summary */}
        <div className="px-4 py-3 flex-1 flex flex-col min-h-0 space-y-2">
          {editing ? (
            <textarea
              value={draft.summary}
              onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
              className="w-full flex-1 min-h-15 text-sm bg-transparent outline-none resize-none text-(--sea-ink-soft) border border-(--line) rounded-lg p-2 wrap-break-word"
              placeholder="Describe the beat. Type @CharacterName to tag characters..."
            />
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
              <p className="text-sm text-(--sea-ink-soft) leading-relaxed whitespace-pre-wrap wrap-break-word">
                {data.summary || 'No summary yet...'}
              </p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-(--line)">
            <MapPin className="w-3 h-3 text-(--sea-ink-soft) shrink-0" />
            {editing ? (
              <select
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                className="flex-1 text-sm bg-transparent outline-none border-b border-(--line) text-(--sea-ink-soft) min-w-0"
              >
                <option value="">No location set</option>
                {nodes
                  .filter((n) => n.type === 'location')
                  .map((loc) => {
                    const locData = loc.data as import('#/features/canvas/types/canvas.types').LocationNodeData;
                    return (
                      <option key={loc.id} value={locData.name} className="bg-(--surface) text-(--sea-ink)">
                        {locData.name}
                      </option>
                    );
                  })}
              </select>
            ) : (
              <span className="text-sm text-(--sea-ink-soft) truncate">
                {data.location || 'No location set'}
              </span>
            )}
          </div>

          {/* Character Badges */}
          {characterNames.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <Users className="w-3 h-3 text-(--sea-ink-soft) shrink-0" />
              {characterNames.map((name: string) => (
                <span
                  key={name}
                  className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-end gap-1 px-3 pb-3">
          {editing ? (
            <>
              <button
                onClick={saveEdit}
                className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 hover:bg-violet-200 transition-colors cursor-pointer"
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

        <Handle
          type="source"
          position={Position.Right}
          className="w-3! h-3! border-2! border-violet-500! bg-(--surface)!"
        />
      </div>
    </>
  );
});

StoryBeatNode.displayName = 'StoryBeatNode';
