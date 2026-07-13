import { Link } from '@tanstack/react-router';
import { BookOpen, Calendar, ArrowRight, Pencil } from 'lucide-react';
import type { Story } from '#/features/dashboard/hooks/useStories';

interface StoryCardProps {
  story: Story;
}

/** A glassmorphic card linking to the story's canvas. */
export function StoryCard({ story }: StoryCardProps) {
  const updatedAt = story.updated_at
    ? new Date(story.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Never';

  return (
    <Link to="/canvas/$storyId" params={{ storyId: story.id }} className="group block">
      <article className="island-shell rounded-2xl p-6 h-full flex flex-col gap-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-violet-500/10 group-hover:border-violet-400/40 cursor-pointer">
        {/* Icon & title */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/60 transition-colors">
            <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--sea-ink)] truncate text-base leading-snug">{story.title}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--sea-ink-soft)]">
              <Calendar className="w-3 h-3" />
              <span>{updatedAt}</span>
            </div>
          </div>
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
  );
}
