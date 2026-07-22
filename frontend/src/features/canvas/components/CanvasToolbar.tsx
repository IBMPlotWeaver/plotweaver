import { Maximize2, Trash2, Save, LayoutGrid, Moon, Sun, Edit2, Check, ArrowLeft, RotateCcw } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';
import { useThemeStore } from '#/features/store/useThemeStore';
import { computeAutoLayout } from '#/features/canvas/utils/autoLayout';
import { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/features/shadcn/components/ui/dialog';
import { Button } from '#/features/shadcn/components/ui/button';

interface CanvasToolbarProps {
  storyTitle?: string;
  isGuestMode?: boolean;
  onTitleChange?: (title: string) => void;
  onGuestSave?: () => void;
  onGuestReset?: () => void;
}

/**
 * Floating toolbar for the story canvas.
 * Provides node creation, zoom, fit-view, and save controls.
 */
export function CanvasToolbar({ storyTitle = 'Untitled Story', isGuestMode = false, onTitleChange, onGuestSave, onGuestReset }: CanvasToolbarProps) {
  const { fitView } = useReactFlow();
  const deleteNode = useCanvasStore(state => state.deleteNode)
  const selectedNodeId = useCanvasStore(state => state.selectedNodeId)
  const saveCanvas = useCanvasStore(state => state.saveCanvas)
  const setNodes = useCanvasStore(state => state.setNodes)
  const hasUnsavedChanges = useCanvasStore(state => state.hasUnsavedChanges)
  const { theme, toggleTheme } = useThemeStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(storyTitle);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(storyTitle);
  }, [storyTitle]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSave = async () => {
    if (isGuestMode) {
      onGuestSave?.();
      return;
    }
    setIsSaving(true);
    try {
      await saveCanvas();
    } catch (error) {
      console.error('Failed to save canvas:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoLayout = () => {
    const { nodes, edges } = useCanvasStore.getState();
    const laid = computeAutoLayout(nodes, edges);
    setNodes(laid);
    setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50);
  };

  const handleTitleSave = () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== storyTitle) {
      onTitleChange?.(trimmedTitle);
    } else {
      setEditedTitle(storyTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(storyTitle);
      setIsEditingTitle(false);
    }
  };

  return (
    <>
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="max-w-md bg-(--surface) border-(--line) text-(--sea-ink)">
          <DialogHeader>
            <DialogTitle>Reset Workspace</DialogTitle>
            <DialogDescription className="text-(--sea-ink-soft) mt-2">
              Are you sure you want to reset your workspace? This will delete all your nodes and connections. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
              className="border-(--line) text-(--sea-ink) hover:bg-(--line)"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onGuestReset?.();
                setIsResetDialogOpen(false);
              }}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 flex-wrap justify-center pointer-events-auto">
      {/* Back to Dashboard */}
      <Link
        to={isGuestMode ? "/" : "/dashboard"}
        className="island-shell flex items-center gap-2 px-3 py-2 rounded-full text-base font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) hover:bg-(--line) transition-colors cursor-pointer"
        title={isGuestMode ? "Back" : "Back to Dashboard"}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">{isGuestMode ? "Back" : "Dashboard"}</span>
      </Link>

      {/* Story title chip */}
      <div className="island-shell px-4 py-2 rounded-full flex items-center gap-2">
        {isEditingTitle ? (
          <>
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleSave}
              className="text-base font-semibold text-(--sea-ink) bg-transparent border-none outline-none w-40"
              maxLength={50}
            />
            <button
              onClick={handleTitleSave}
              className="p-1 rounded text-(--sea-ink-soft) hover:text-(--sea-ink) hover:bg-(--line) transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <span className="text-base font-semibold text-(--sea-ink) truncate max-w-40 block">
              {storyTitle}
            </span>
            {isGuestMode && onTitleChange && (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-1 rounded text-(--sea-ink-soft) hover:text-(--sea-ink) hover:bg-(--line) transition-colors"
                title="Edit title"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {hasUnsavedChanges && (
              <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" title="Unsaved changes" />
            )}
          </>
        )}
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-(--line)" />

      {/* Viewport controls */}
      <div className="island-shell flex items-center gap-1 p-1 rounded-full">
        <button
          onClick={() => fitView({ padding: 0.2 })}
          title="Fit view"
          className="p-2 rounded-full text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleAutoLayout}
          title="Auto-layout nodes"
          className="p-2 rounded-full text-(--sea-ink-soft) hover:bg-(--line) transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-(--line)" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="island-shell p-2 rounded-full text-(--sea-ink-soft) hover:bg-(--line) hover:text-(--sea-ink) transition-all cursor-pointer"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Divider */}
      <div className="h-8 w-px bg-(--line)" />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="island-shell flex items-center gap-1.5 px-3 py-2 rounded-full text-base font-medium text-(--sea-ink) hover:bg-(--line) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title="Save canvas"
      >
        <Save className={`w-4 h-4 ${isSaving && !isGuestMode ? 'animate-pulse' : ''}`} />
        <span className="hidden sm:inline">
          {isGuestMode ? 'Sign up to Save' : isSaving ? 'Saving...' : 'Save'}
        </span>
      </button>

      {/* Reset workspace (Guest Mode) */}
      {isGuestMode && (
        <>
          <div className="h-8 w-px bg-(--line)" />
          <button
            onClick={() => setIsResetDialogOpen(true)}
            title="Reset workspace"
            className="island-shell flex items-center gap-1.5 px-3 py-2 rounded-full text-base font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </>
      )}

      {/* Delete selected node */}
      {selectedNodeId && (
        <>
          <div className="h-8 w-px bg-(--line)" />
          <button
            onClick={() => deleteNode(selectedNodeId)}
            title="Delete selected node"
            className="island-shell flex items-center gap-1.5 px-3 py-2 rounded-full text-base font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </>
      )}
    </div>
    </>
  );
}