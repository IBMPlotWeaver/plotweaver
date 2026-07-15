import { Button } from '#/features/shadcn/components/ui/button';
import { useThemeStore } from '#/features/store/useThemeStore';
import { Moon, Sun } from 'lucide-react';
import { Link } from '@tanstack/react-router';

/**
 * Floating header for public/guest pages (landing, login, signup).
 */
export function Header() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="sticky top-6 z-50 w-full flex justify-center px-4 pt-2">
      <header className="flex items-center justify-between px-6 py-3 w-full max-w-5xl glass border border-(--line) rounded-full transition-all">
        <div className="flex items-center gap-3">
          <img src="/plotweaver-logo.png" alt="PlotWeaver Logo" className="h-8 w-auto object-contain" />
          <Link to="/" className="text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <span className="text-xl font-bold tracking-tight text-violet-600 dark:text-violet-400 display-title">PlotWeaver</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Link to="/login" className="text-sm font-medium text-(--sea-ink-soft) hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Log In
          </Link>
          <Link to="/signup">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 shadow-md shadow-violet-500/20 border-none">
              Get Started
            </Button>
          </Link>
        </div>
      </header>
    </div>
  );
}
