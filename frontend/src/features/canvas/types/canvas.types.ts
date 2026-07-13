import type { Node, Edge } from '@xyflow/react';

/** The node types available on the story canvas */
export type StoryNodeType = 'scene' | 'character' | 'event';

/** Data payload stored inside each story node */
export interface StoryNodeData extends Record<string, unknown> {
  title: string;
  content: string;
  type: StoryNodeType;
  tags?: string[];
}

/** A React Flow node extended with PlotWeaver data */
export type StoryNode = Node<StoryNodeData, StoryNodeType>;

/** A React Flow edge connecting two story nodes */
export type StoryEdge = Edge;

/** Shape of the Zustand canvas store */
export interface CanvasState {
  nodes: StoryNode[];
  edges: StoryEdge[];
  selectedNodeId: string | null;
  addNode: (type: StoryNodeType, position?: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<StoryNodeData>) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: StoryNode[]) => void;
  setEdges: (edges: StoryEdge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
}
