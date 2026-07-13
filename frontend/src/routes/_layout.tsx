import { Outlet, createFileRoute } from '@tanstack/react-router';
import { Header } from '#/features/landing/components/Header';
import Aurora from '#/features/landing/components/react-bits/Aurora';

export const Route = createFileRoute('/_layout')({
  component: AppLayout,
});

/**
 * Shared layout for public and authenticated pages.
 * Provides the floating Header and the Aurora animated background.
 * Child routes render via <Outlet />.
 */
function AppLayout() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sans">
      {/* Shared animated background */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <Aurora
          colorStops={['#8b5cf6', '#d946ef', '#f43f5e']}
          blend={0.5}
          amplitude={1.0}
          speed={0.8}
        />
      </div>

      {/* Shared floating header */}
      <Header />

      {/* Page content */}
      <div className="relative z-10 flex flex-col flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
