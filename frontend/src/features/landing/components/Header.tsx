import { Button } from '#/features/shadcn/components/ui/button';

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <img src="/plotweaver-logo.png" alt="PlotWeaver Logo" className="h-8 w-auto object-contain" />
        <span className="text-xl font-bold tracking-tight text-violet-600 dark:text-violet-400">PlotWeaver</span>
      </div>
      <nav className="hidden md:flex gap-8 items-center font-medium text-sm">
        <a href="#features" className="text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400 transition-colors">Features</a>
        <a href="#why-us" className="text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400 transition-colors">Why PlotWeaver</a>
      </nav>
      <div className="flex items-center gap-4">
        <a href="/login" className="text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
          Log In
        </a>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 shadow-md shadow-violet-500/20">
          Get Started
        </Button>
      </div>
    </header>
  );
}
