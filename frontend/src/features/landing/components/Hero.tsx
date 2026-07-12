import { Button } from '#/features/shadcn/components/ui/button';
import { Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
      <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full island-shell">
        <Sparkles className="w-4 h-4 text-fuchsia-500" />
        <span className="text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400">
          AI-Powered Visual Storytelling Workspace
        </span>
      </div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight display-title">
        Weave Your Story,<br />
        <span className="bg-linear-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
          Visually.
        </span>
      </h1>
      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed">
        PlotWeaver replaces long text documents with connected nodes. Our AI acts as your Creative Partner, detecting plot holes, maintaining continuity, and brainstorming ideas—without ever writing the story for you.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8 shadow-lg shadow-violet-500/25">
          Start Weaving for Free
        </Button>
        <Button size="lg" variant="outline" className="rounded-full px-8 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
          View Interactive Demo
        </Button>
      </div>
    </section>
  );
}
