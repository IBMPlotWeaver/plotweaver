import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useParams } from '@tanstack/react-router';

import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';
import { CanvasToolbar } from '#/features/canvas/components/CanvasToolbar';
import { NodesSidebar } from '#/features/canvas/components/NodesSidebar';
import { StoryBeatNode } from '#/features/canvas/components/nodes/StoryBeatNode';
import { CharacterNode } from '#/features/canvas/components/nodes/CharacterNode';
import { WorldRuleNode } from '#/features/canvas/components/nodes/WorldRuleNode';
import { LocationNode } from '#/features/canvas/components/nodes/LocationNode';
import { ObjectNode } from '#/features/canvas/components/nodes/ObjectNode';
import { EventNode } from '#/features/canvas/components/nodes/EventNode';
import { ConflictNode } from '#/features/canvas/components/nodes/ConflictNode';
import { GoalNode } from '#/features/canvas/components/nodes/GoalNode';
import { SecretNode } from '#/features/canvas/components/nodes/SecretNode';
import { ThreadNode } from '#/features/canvas/components/nodes/ThreadNode';
import { useUnsavedChangesWarning } from '#/features/canvas/hooks/useUnsavedChangesWarning';
import { computeAutoLayout } from '#/features/canvas/utils/autoLayout';
import { AIInsightsPanel } from '#/features/canvas/components/AIInsightsPanel';
import { ZoomControls } from '#/features/canvas/components/ZoomControls';
import { useReactFlow } from '@xyflow/react';
import { useStory } from '#/features/canvas/hooks/useStory';
import { useGuestCanvas } from '#/features/canvas/hooks/useGuestCanvas';
import { useMigrateGuestCanvas } from '#/features/canvas/hooks/useMigrateGuestCanvas';
import { AlertCircle, Loader2 } from 'lucide-react';
import { SignupModal } from '#/features/auth/components/SignupModal';
import { MigrateGuestCanvasDialog } from '#/features/canvas/components/MigrateGuestCanvasDialog';

/** Stable node type map — defined outside component to prevent remount on re-render. */
const NODE_TYPES = {
  storyBeat: StoryBeatNode,
  character: CharacterNode,
  worldRule: WorldRuleNode,
  location: LocationNode,
  object: ObjectNode,
  event: EventNode,
  conflict: ConflictNode,
  goal: GoalNode,
  secret: SecretNode,
  thread: ThreadNode,
} as const;

/**
 * Invisible helper component to run auto-layout once when a story is first loaded.
 */
function AutoLayoutOnLoad() {
  const { fitView } = useReactFlow();
  const nodes = useCanvasStore(state => state.nodes)
  const edges = useCanvasStore(state => state.edges)
  const setNodes = useCanvasStore(state => state.setNodes)
  const storyId = useCanvasStore(state => state.storyId)
  const [lastLayoutId, setLastLayoutId] = useState<string | null>(null);

  useEffect(() => {
    // Only layout once per story load when nodes are populated
    if (storyId && storyId !== lastLayoutId && nodes.length > 0) {
      const laid = computeAutoLayout(nodes, edges);
      setNodes(laid);
      setLastLayoutId(storyId);
      // Wait a tick for nodes to render their new positions before fitting
      setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50);
    }
  }, [storyId, nodes.length, edges, lastLayoutId, setNodes, fitView]);

  return null;
}

/**
 * Main story canvas page. Renders the ReactFlow canvas with custom nodes,
 * a collapsible nodes sidebar, a floating toolbar, minimap, and background grid.
 */
export function StoryCanvas({ isGuestMode = false }: { isGuestMode?: boolean }) {
  const params = useParams({ strict: false });
  const storyId = isGuestMode ? null : (params as { storyId?: string }).storyId;
  const { data: story } = useStory(storyId || '');
  const { loadGuestCanvas, getRemainingAICount, clearGuestCanvas } = useGuestCanvas();
  const {
    promptMigration,
    handleSave,
    handleDiscard,
    closeDialog,
    showDialog: showMigrationDialog,
    isMigrating
  } = useMigrateGuestCanvas();

  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [guestTitle, setGuestTitle] = useState(() => {
    if (isGuestMode) {
      return localStorage.getItem('plotweaver_guest_title') || 'My Story';
    }
    return 'My Story';
  });
  const nodes = useCanvasStore(state => state.nodes)
  const edges = useCanvasStore(state => state.edges)
  const onNodesChange = useCanvasStore(state => state.onNodesChange)
  const onEdgesChange = useCanvasStore(state => state.onEdgesChange)
  const onConnect = useCanvasStore(state => state.onConnect)
  const setSelectedNodeId = useCanvasStore(state => state.setSelectedNodeId)
  const loadCanvas = useCanvasStore(state => state.loadCanvas)
  const saveCanvas = useCanvasStore(state => state.saveCanvas)
  const setStoryId = useCanvasStore(state => state.setStoryId)

  // Enable unsaved changes warning
  useUnsavedChangesWarning();

  // Load canvas data when component mounts or storyId changes
  useEffect(() => {
    if (isGuestMode) {
      loadGuestCanvas();
      setIsLoading(false);
    } else if (storyId) {
      setStoryId(storyId);
      setIsLoading(true);
      loadCanvas(storyId)
        .then(() => setIsLoading(false))
        .catch((error) => {
          console.error('Failed to load canvas:', error);
          setIsLoading(false);
        });
    }
  }, [isGuestMode, storyId, loadCanvas, loadGuestCanvas, setStoryId]);

  // Auto-save canvas periodically (every 30 seconds for authenticated, handled by hook for guest)
  useEffect(() => {
    if (isGuestMode || !storyId) return;

    const interval = setInterval(() => {
      if (!useCanvasStore.getState().hasUnsavedChanges) return;
      saveCanvas().catch((error) => {
        console.error('Auto-save failed:', error);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [isGuestMode, storyId, saveCanvas]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const handleSignupSuccess = (userId: string) => {
    setShowSignupModal(false);
    promptMigration(userId);
  };

  const handleTitleChange = (newTitle: string) => {
    setGuestTitle(newTitle);
    if (isGuestMode) {
      localStorage.setItem('plotweaver_guest_title', newTitle);
    }
  };

  const handleGuestReset = () => {
    clearGuestCanvas();
    localStorage.removeItem('plotweaver_guest_title');
    setGuestTitle('My Story');
  };

  const displayTitle = isGuestMode ? guestTitle : (story?.title || 'Loading...');

  return (
    <>
      <SignupModal
        open={showSignupModal}
        onOpenChange={setShowSignupModal}
        onSuccess={handleSignupSuccess}
      />
      <MigrateGuestCanvasDialog
        open={showMigrationDialog}
        onOpenChange={closeDialog}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isMigrating={isMigrating}
      />
      <div className="relative w-screen h-screen overflow-hidden bg-(--bg-base)">
        {/* Guest Mode Banner - Compact and positioned outside canvas */}
        {isGuestMode && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-linear-to-r from-violet-600 to-fuchsia-500 text-white px-4 py-2 flex items-center justify-center shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm font-medium">
                Guest Mode • AI: {getRemainingAICount()}/3 remaining
              </p>
            </div>
          </div>
        )}
        <div className={isGuestMode ? 'h-full pt-11' : 'h-full'}>
          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-(--bg-base)/80 backdrop-blur-sm animate-in fade-in duration-300">
              <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
              <p className="text-lg font-medium text-(--sea-ink)">Loading canvas...</p>
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            selectionMode={SelectionMode.Partial}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              animated: true,
              style: { strokeWidth: 2, stroke: 'var(--lagoon)' },
            }}
          >
            <AutoLayoutOnLoad />

            {/* Sidebar inside ReactFlow so useReactFlow() context is available */}
            <NodesSidebar />

            {/* Toolbar floats at top-center */}
            <CanvasToolbar
              storyTitle={displayTitle}
              isGuestMode={isGuestMode}
              onTitleChange={handleTitleChange}
              onGuestSave={() => setShowSignupModal(true)}
              onGuestReset={handleGuestReset}
            />

            {/* AI Insights panel — slides in from the right */}
            <AIInsightsPanel />

            {/* Zoom controls at the bottom */}
            <ZoomControls />

            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.5}
              color="var(--line)"
            />

            <Controls
              className="bottom-6! left-6! md:left-72! shadow-lg! rounded-2xl! border! border-(--line)! bg-(--surface)! backdrop-blur! transition-all duration-300"
              showInteractive={false}
            />

            <MiniMap
              className="bottom-6! right-6! rounded-2xl! border! border-(--line)! bg-(--surface)! shadow-lg!"
              nodeColor={(node) => {
                const colors: Record<string, string> = {
                  storyBeat: '#8b5cf6',
                  character: '#d946ef',
                  worldRule: '#7c3aed',
                };
                return colors[node.type ?? ''] ?? '#94a3b8';
              }}
              maskColor="rgba(0,0,0,0.04)"
            />
          </ReactFlow>
        </div>
      </div>
    </>
  );
}