import { useState, useEffect } from 'react';
import { Button } from '#/features/shadcn/components/ui/button';
import { Input } from '#/features/shadcn/components/ui/input';
import { Pencil, X, Loader2 } from 'lucide-react';
import { useUpdateStory } from '../hooks/useStoryMutations';
import type { Story } from '../hooks/useStories';

interface EditStoryDialogProps {
  story: Story | null;
  onClose: () => void;
}

export function EditStoryDialog({ story, onClose }: EditStoryDialogProps) {
  const updateStory = useUpdateStory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Sync initial values
  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setDescription(story.description || '');
    }
  }, [story]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !title.trim()) return;

    updateStory.mutate(
      {
        id: story.id,
        title: title.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="island-shell rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--sea-ink)]">Edit Story</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--sea-ink-soft)] hover:bg-[var(--line)] transition-colors"
            disabled={updateStory.isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-[var(--sea-ink)] mb-1.5">
              Story Title *
            </label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your story title..."
              className="w-full"
              disabled={updateStory.isPending}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-[var(--sea-ink)] mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your story..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-transparent text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              rows={3}
              disabled={updateStory.isPending}
            />
          </div>

          {/* Error message */}
          {updateStory.isError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {updateStory.error?.message || 'Failed to update story. Please try again.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
              disabled={updateStory.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white border-none"
              disabled={updateStory.isPending || !title.trim()}
            >
              {updateStory.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
