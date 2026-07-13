import { useQuery } from '@tanstack/react-query';
import { supabase } from '#/lib/supabase';
import { Button } from '#/features/shadcn/components/ui/button';
import { StoryCard } from './StoryCard';
import { useStories } from '../hooks/useStories';
import { BookOpen, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export function DashboardPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: stories, isLoading, error } = useStories(user?.id);

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Writer';
  const storyCount = stories?.length ?? 0;

  return (
    <main className="grow px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* ── Welcome bar ───────────────────────────── */}
      <div className="mb-8 sm:mb-10 animate-blur-reveal text-center mt-10 sm:mt-14">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight display-title text-(--sea-ink)">
          Welcome back, {displayName} ✦
        </h1>
        <p className="mt-1 text-sm sm:text-base text-(--sea-ink-soft)">
          {storyCount === 0
            ? 'Your canvas awaits — create your first story.'
            : `You have ${storyCount} ${storyCount === 1 ? 'story' : 'stories'} in progress.`}
        </p>
      </div>

      {/* ── Loading ──────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-sm text-(--sea-ink-soft)">Loading your stories…</p>
        </div>
      )}

      {/* ── Error ───────────────────────────────── */}
      {error && (
        <div className="island-shell rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-rose-300 dark:border-rose-800">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-(--sea-ink)">Could not load stories</p>
            <p className="text-sm text-(--sea-ink-soft)">{error.message}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="rounded-full self-end sm:self-auto"
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Empty state ──────────────────────────── */}
      {!isLoading && !error && storyCount === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-6 animate-blur-reveal [animation-delay:200ms]">
          <div className="island-shell rounded-3xl p-8 sm:p-12 text-center max-w-md w-full shadow-2xl shadow-violet-500/10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-violet-500" />
            </div>
            <h2 className="text-xl font-bold display-title text-(--sea-ink) mb-2">No stories yet</h2>
            <p className="text-sm text-(--sea-ink-soft) mb-6 leading-relaxed">
              Create your first story and start weaving your narrative with AI assistance. Every great story starts with a single node.
            </p>
            <Button className="w-full rounded-xl h-11 bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white border-none shadow-lg shadow-violet-500/20 gap-2">
              <Sparkles className="w-4 h-4" />
              Create Your First Story
            </Button>
          </div>
        </div>
      )}

      {/* ── Stories grid ─────────────────────────── */}
      {!isLoading && !error && storyCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-blur-reveal [animation-delay:150ms]">
          {stories?.map((story, i) => (
            <div
              key={story.id}
              className="animate-blur-reveal opacity-0"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
