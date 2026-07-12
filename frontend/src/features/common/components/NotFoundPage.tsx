import { Link } from '@tanstack/react-router';
import { Button } from '#/features/shadcn/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';
import Aurora from '#/features/landing/components/react-bits/Aurora';

export function NotFoundPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Aurora colorStops={['#f43f5e', '#8b5cf6', '#d946ef']} speed={0.5} amplitude={1.2} />
      </div>
      <div className="grow flex items-center justify-center p-6 relative z-10 animate-blur-reveal">
        <div className="island-shell p-12 rounded-3xl transition-all duration-500 shadow-2xl shadow-violet-500/10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 display-title">404</h1>
          <h2 className="text-xl font-semibold mb-2 text-(--sea-ink)">Page not found</h2>
          <p className="text-(--sea-ink-soft) mb-8">
            The story thread you're looking for seems to have unraveled.
          </p>
          <Link to="/">
            <Button className="w-full h-12 bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white rounded-xl shadow-lg shadow-violet-500/25 border-none cursor-pointer">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
