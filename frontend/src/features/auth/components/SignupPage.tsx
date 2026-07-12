import { Button } from '#/features/shadcn/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import Aurora from '#/features/landing/components/react-bits/Aurora';
import { Header } from '#/features/landing/components/Header';

export function SignupPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sans">
      <Header />
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Aurora colorStops={['#f43f5e', '#d946ef', '#8b5cf6']} speed={0.5} amplitude={1.2} />
      </div>
      <div className="grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 display-title mt-4">Create an account</h1>
          </div>

          <div className="island-shell p-8 rounded-3xl transition-all duration-500 shadow-2xl shadow-violet-500/10">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--sea-ink)">Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl bg-(--surface) border border-(--line) focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--sea-ink)">Email Address</label>
                <input
                  type="email"
                  placeholder="author@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-(--surface) border border-(--line) focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--sea-ink)">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-(--surface) border border-(--line) focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)"
                />
              </div>

              <Button className="w-full bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white rounded-xl py-6 mt-4 shadow-lg shadow-violet-500/25 group transition-all duration-300 border-none">
                <span className="text-base font-semibold">Create Account</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-(--line) text-center">
              <p className="text-(--sea-ink-soft) text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
