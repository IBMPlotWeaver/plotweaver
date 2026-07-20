import { useState } from 'react';
import { Button } from '#/features/shadcn/components/ui/button';
import { Input } from '#/features/shadcn/components/ui/input';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { useCreateStory } from '../hooks/useStoryMutations';
import { useCurrentUser } from '#/lib/useCurrentUser';
import { QuickCreateModal } from './QuickCreateModal';

interface CreateStoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStoryDialog({ isOpen, onClose }: CreateStoryDialogProps) {
  const { data: user } = useCurrentUser();
  const createStory = useCreateStory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [createdStoryId, setCreatedStoryId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !title.trim()) return;

    createStory.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        userId: user.id,
      },
      {
        onSuccess: (story) => {
          setTitle('');
          setDescription('');
          setCreatedStoryId(story.id);
          setShowQuickCreate(true);
          onClose();
        },
      }
    );
  };

  const handleQuickCreateClose = () => {
    setShowQuickCreate(false);
    setCreatedStoryId(null);
  };

  return (
    <>
      <QuickCreateModal
        isOpen={showQuickCreate}
        onClose={handleQuickCreateClose}
        storyId={createdStoryId || ''}
      />
      {isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="island-shell rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-(--sea-ink)">Create New Story</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-(--sea-ink-soft) hover:bg-(--line) transition-colors"
            disabled={createStory.isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-(--sea-ink) mb-1.5">
              Story Title *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your story title..."
              className="w-full"
              disabled={createStory.isPending}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-(--sea-ink) mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your story..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-(--line) bg-transparent text-(--sea-ink) placeholder:text-(--sea-ink-soft) focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              rows={3}
              disabled={createStory.isPending}
            />
          </div>

          {/* Error message */}
          {createStory.isError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {createStory.error?.message || 'Failed to create story. Please try again.'}
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
              disabled={createStory.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white border-none shadow-lg shadow-violet-500/20"
              disabled={createStory.isPending || !title.trim()}
            >
              {createStory.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Story
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
      )}
    </>
  );
}
