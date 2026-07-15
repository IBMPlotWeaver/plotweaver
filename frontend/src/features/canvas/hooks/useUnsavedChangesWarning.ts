import { useEffect } from 'react';
import { useBlocker } from '@tanstack/react-router';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';

export function useUnsavedChangesWarning() {
  const hasUnsavedChanges = useCanvasStore((state) => state.hasUnsavedChanges)

  // 1. Block client-side navigation (TanStack Router)
  useBlocker({
    shouldBlockFn: () => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
        return !confirmed; // Block navigation if the user cancels
      }
      return false; // Allow navigation
    },
  });

  // 2. Block browser reloads and tab closes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for modern browsers to show the native warning dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
}
