import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '#/lib/supabase';
import { useGuestCanvas } from './useGuestCanvas';


interface MigrationState {
  showDialog: boolean;
  userId: string | null;
}

/**
 * Hook for migrating guest canvas data to authenticated user's database.
 * Should be called after successful signup/login.
 */
export function useMigrateGuestCanvas() {
  const navigate = useNavigate();
  const { getGuestCanvasData, hasGuestCanvas, clearGuestCanvas } = useGuestCanvas();
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationState, setMigrationState] = useState<MigrationState>({
    showDialog: false,
    userId: null,
  });

  /**
   * Migrate guest canvas to database for authenticated user
   */
  const migrateGuestCanvas = useCallback(async (userId: string): Promise<string | null> => {
    if (!hasGuestCanvas()) {
      return null;
    }

    setIsMigrating(true);
    setError(null);

    try {
      const guestData = getGuestCanvasData();
      if (!guestData) {
        throw new Error('No guest canvas data found');
      }

      const { nodes, edges } = guestData;

      const guestTitle = localStorage.getItem('plotweaver_guest_title') || 'My Story';

      // Invoke the Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('save-guest-canvas', {
        body: {
          title: guestTitle,
          nodes,
          edges,
        },
      });

      if (functionError) {
        throw new Error('Migration failed: ' + functionError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data || !data.storyId) {
        throw new Error('Migration failed: No storyId returned');
      }

      const storyId = data.storyId as string;

      // Clear guest canvas after successful migration
      clearGuestCanvas();

      setIsMigrating(false);
      return storyId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to migrate guest canvas';
      setError(errorMessage);
      setIsMigrating(false);
      console.error('Migration error:', err);
      return null;
    }
  }, [hasGuestCanvas, getGuestCanvasData, clearGuestCanvas]);

  /**
   * Show dialog to prompt user to migrate guest canvas
   */
  const promptMigration = useCallback((userId: string) => {
    if (!hasGuestCanvas()) {
      navigate({ to: '/dashboard' });
      return;
    }

    setMigrationState({
      showDialog: true,
      userId,
    });
  }, [hasGuestCanvas, navigate]);

  /**
   * Handle save action from dialog
   */
  const handleSave = useCallback(async () => {
    if (!migrationState.userId) return;

    const storyId = await migrateGuestCanvas(migrationState.userId);
    
    if (storyId) {
      setMigrationState({ showDialog: false, userId: null });
      navigate({ to: '/canvas/$storyId', params: { storyId } });
    }
  }, [migrationState.userId, migrateGuestCanvas, navigate]);

  /**
   * Handle discard action from dialog
   */
  const handleDiscard = useCallback(() => {
    clearGuestCanvas();
    setMigrationState({ showDialog: false, userId: null });
    navigate({ to: '/dashboard' });
  }, [clearGuestCanvas, navigate]);

  /**
   * Close dialog without action
   */
  const closeDialog = useCallback(() => {
    setMigrationState({ showDialog: false, userId: null });
    navigate({ to: '/dashboard' });
  }, [navigate]);

  return {
    migrateGuestCanvas,
    promptMigration,
    handleSave,
    handleDiscard,
    closeDialog,
    isMigrating,
    error,
    showDialog: migrationState.showDialog,
    hasGuestCanvas: hasGuestCanvas(),
  };
}
