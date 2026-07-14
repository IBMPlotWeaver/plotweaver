import { useCallback, useEffect } from 'react';
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
import { useUnsavedChangesWarning } from '#/features/canvas/hooks/useUnsavedChangesWarning';
import { computeAutoLayout } from '#/features/canvas/utils/autoLayout';
import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';

/** Stable node type map — defined outside component to prevent remount on re-render. */
const NODE_TYPES = {
  storyBeat: StoryBeatNode,
  character: CharacterNode,
  worldRule: WorldRuleNode,
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
export function StoryCanvas() {
  const { storyId } = useParams({ from: '/canvas/$storyId' });
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
    if (storyId) {
      setStoryId(storyId);
      loadCanvas(storyId).catch((error) => {
        console.error('Failed to load canvas:', error);
      });
    }
  }, [storyId, loadCanvas, setStoryId]);

  // Auto-save canvas periodically (every 30 seconds)
  useEffect(() => {
    if (!storyId) return;

    const interval = setInterval(() => {
      if (!useCanvasStore.getState().hasUnsavedChanges) return;
      saveCanvas().catch((error) => {
        console.error('Auto-save failed:', error);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [storyId, saveCanvas]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-(--bg-base)">
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
        <CanvasToolbar storyTitle={`Story — ${storyId}`} />

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
  );
}