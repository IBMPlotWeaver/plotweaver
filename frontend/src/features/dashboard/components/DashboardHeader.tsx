import { Link, useNavigate } from '@tanstack/react-router';
import { supabase } from '#/lib/supabase';
import { useThemeStore } from '#/features/store/useThemeStore';
import { Button } from '#/features/shadcn/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/features/shadcn/components/ui/dropdown-menu';
import {
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  Settings,
} from 'lucide-react';

/**
 * Floating header for authenticated dashboard pages.
 * Groups theme, profile, and sign-out into a single user dropdown.
 */
export function DashboardHeader() {
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  return (
    <div className="sticky top-6 z-50 w-full flex justify-center px-4 pt-2">
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 w-full max-w-5xl glass border border-(--line) rounded-full transition-all">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src="/plotweaver-logo.png" alt="PlotWeaver Logo" className="h-8 w-auto object-contain" />
          <Link to="/dashboard" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <span className="text-xl font-bold tracking-tight text-violet-600 dark:text-violet-400 display-title">
              PlotWeaver
            </span>
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full gap-1.5 px-3 text-(--sea-ink-soft) hover:text-(--sea-ink) hover:bg-(--line)"
              >
                <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <ChevronDown className="h-3.5 w-3.5 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={12}
              className="w-52 rounded-2xl island-shell border-(--line) p-1.5 shadow-xl shadow-violet-500/10"
            >
              {/* Theme toggle */}
              <DropdownMenuItem
                onClick={toggleTheme}
                className="rounded-xl gap-3 px-3 py-2.5 cursor-pointer text-(--sea-ink-soft) hover:text-(--sea-ink) focus:text-(--sea-ink)"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </DropdownMenuItem>

              {/* Profile */}
              <DropdownMenuItem asChild className="rounded-xl gap-3 px-3 py-2.5 cursor-pointer text-(--sea-ink-soft) hover:text-(--sea-ink) focus:text-(--sea-ink)">
                <Link to="/profile">
                  <Settings className="h-4 w-4" />
                  <span>Profile & Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5 bg-(--line)" />

              {/* Sign out */}
              <DropdownMenuItem
                onClick={handleSignOut}
                className="rounded-xl gap-3 px-3 py-2.5 cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50 dark:focus:bg-rose-950/40 focus:text-rose-600 dark:focus:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
