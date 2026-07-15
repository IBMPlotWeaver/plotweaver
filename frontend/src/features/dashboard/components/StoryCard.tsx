import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { BookOpen, Calendar, ArrowRight, Trash2, MoreVertical, Loader2, Pencil } from 'lucide-react';
import type { Story } from '#/features/dashboard/hooks/useStories';
import { useDeleteStory } from '../hooks/useStoryMutations';
import { EditStoryDialog } from './EditStoryDialog';

interface StoryCardProps {
  story: Story;
}

/** A glassmorphic card linking to the story's canvas. */
export function StoryCard({ story }: StoryCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const deleteStory = useDeleteStory();

  const updatedAt = story.updated_at
    ? new Date(story.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Never';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditDialog(true);
    setShowMenu(false);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteStory.mutate(story.id);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div className="relative">
      <Link to="/canvas/$storyId" params={{ storyId: story.id }} className="group block">
        <article className="island-shell rounded-2xl p-6 h-full flex flex-col gap-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-violet-500/10 group-hover:border-violet-400/40 cursor-pointer">
          {/* Icon & title */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/60 transition-colors">
              <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--sea-ink)] truncate text-base leading-snug">
                {story.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--sea-ink-soft)]">
                <Calendar className="w-3 h-3" />
                <span>{updatedAt}</span>
              </div>
            </div>
            {/* Menu button */}
            <button
              onClick={toggleMenu}
              className="p-1.5 rounded-lg text-[var(--sea-ink-soft)] hover:bg-[var(--line)] transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--sea-ink-soft)] leading-relaxed line-clamp-2 flex-1">
            {story.description ?? 'No description yet. Open the canvas to start weaving.'}
          </p>

          {/* CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400">Open canvas</span>
            <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </article>
      </Link>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute top-14 right-2 z-10 island-shell rounded-xl p-1 shadow-lg min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--sea-ink)] hover:bg-[var(--line)] rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Story
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors mt-0.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete Story
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={cancelDelete}
        >
          <div
            className="island-shell rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--sea-ink)] mb-1">Delete Story?</h3>
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  This will permanently delete "{story.title}" and all its content. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={cancelDelete}
                disabled={deleteStory.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-xl border border-[var(--line)] text-[var(--sea-ink)] hover:bg-[var(--line)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteStory.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteStory.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditStoryDialog
          story={story}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </div>
  );
}