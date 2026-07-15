import { Outlet, createFileRoute } from '@tanstack/react-router';
import { DashboardHeader } from '#/features/dashboard/components/DashboardHeader';
import Aurora from '#/features/landing/components/react-bits/Aurora';

export const Route = createFileRoute('/_dashboard-layout')({
  component: DashboardLayout,
});

/**
 * Layout for authenticated dashboard pages.
 * Provides the DashboardHeader (with Profile, New Story, Sign Out)
 * and the shared Aurora animated background.
 */
function DashboardLayout() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <Aurora colorStops={['#8b5cf6', '#d946ef', '#f43f5e']} blend={0.5} amplitude={1.0} speed={0.8} />
      </div>
      <DashboardHeader />
      <div className="relative z-10 flex flex-col flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
