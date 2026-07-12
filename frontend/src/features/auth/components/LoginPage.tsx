import { Button } from '#/features/shadcn/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import Aurora from '#/features/landing/components/react-bits/Aurora';
import { Header } from '#/features/landing/components/Header';

export function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sans">
      <Header />
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Aurora colorStops={['#8b5cf6', '#d946ef', '#f43f5e']} speed={0.5} amplitude={1.2} />
      </div>
      <div className="grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 display-title mt-4">Welcome back</h1>
            <p className="text-(--sea-ink-soft)">Sign in to continue weaving your story.</p>
          </div>

          <div className="island-shell p-8 rounded-3xl transition-all duration-500 shadow-2xl shadow-violet-500/10">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--sea-ink)">Email Address</label>
                <input
                  type="email"
                  placeholder="author@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-(--surface) border border-(--line) focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-(--sea-ink)">Password</label>
                  <a href="#" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">Forgot password?</a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-(--surface) border border-(--line) focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)"
                />
              </div>

              <Button className="w-full bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white rounded-xl py-6 mt-4 shadow-lg shadow-violet-500/25 group transition-all duration-300 border-none">
                <span className="text-base font-semibold">Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-(--line) text-center">
              <p className="text-(--sea-ink-soft) text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                  Start weaving for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
