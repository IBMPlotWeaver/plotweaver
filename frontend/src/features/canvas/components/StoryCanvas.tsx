import { useCallback } from 'react';
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
import { SceneNode } from '#/features/canvas/components/nodes/SceneNode';
import { CharacterNode } from '#/features/canvas/components/nodes/CharacterNode';
import { EventNode } from '#/features/canvas/components/nodes/EventNode';

/** Stable node type map — defined outside component to prevent remount on re-render. */
const NODE_TYPES = {
  scene: SceneNode,
  character: CharacterNode,
  event: EventNode,
} as const;

/**
 * Main story canvas page. Renders the ReactFlow canvas with custom nodes,
 * the floating toolbar, a minimap, and a background dot grid.
 */
export function StoryCanvas() {
  const { storyId } = useParams({ from: '/canvas/$storyId' });

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
  } = useCanvasStore();

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
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--bg-base)]">
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
        {/* Toolbar floats at top-center inside the ReactFlow container */}
        <CanvasToolbar storyTitle={`Story — ${storyId}`} />

        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="var(--line)"
        />

        <Controls
          className="!bottom-6 !left-6 !shadow-lg !rounded-2xl !border !border-[var(--line)] !bg-[var(--surface)] !backdrop-blur"
          showInteractive={false}
        />

        <MiniMap
          className="!bottom-6 !right-6 !rounded-2xl !border !border-[var(--line)] !bg-[var(--surface)] !shadow-lg"
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              scene: '#8b5cf6',
              character: '#d946ef',
              event: '#f43f5e',
            };
            return colors[node.type ?? ''] ?? '#94a3b8';
          }}
          maskColor="rgba(0,0,0,0.04)"
        />
      </ReactFlow>
    </div>
  );
}
