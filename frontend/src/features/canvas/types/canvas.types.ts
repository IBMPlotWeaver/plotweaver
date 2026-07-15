import type { Node, Edge } from '@xyflow/react';

/** The node types available on the story canvas */
export type StoryNodeType = 'storyBeat' | 'character' | 'worldRule';

/** Base data payload for all nodes */
interface BaseNodeData extends Record<string, unknown> {
  type: StoryNodeType;
}

/** StoryBeatNode data - Maps to story_nodes table */
export interface StoryBeatNodeData extends BaseNodeData {
  type: 'storyBeat';
  title: string;
  summary: string;
  location: string;
  timelineOrder: number;
  characterNames: string[]; // Derived from node_characters join
  hasAIWarning: boolean; // Derived from ai_insights table
}

/** CharacterNode data - Maps to characters table */
export interface CharacterNodeData extends BaseNodeData {
  type: 'character';
  name: string;
  description: string;
  role?: string; // Optional UI flair (e.g., "Protagonist", "Antagonist")
}

/** WorldRuleNode data - Maps to world_rules table */
export interface WorldRuleNodeData extends BaseNodeData {
  type: 'worldRule';
  title: string;
  description: string;
}

/** Union type of all node data types */
export type StoryNodeData = StoryBeatNodeData | CharacterNodeData | WorldRuleNodeData;

/** A React Flow node extended with PlotWeaver data */
export type StoryNode = Node<StoryNodeData, StoryNodeType>;

/** A React Flow edge connecting two story nodes - Maps to story_edges table */
export type StoryEdge = Edge;

/** Shape of the Zustand canvas store */
export interface CanvasState {
  nodes: StoryNode[];
  edges: StoryEdge[];
  selectedNodeId: string | null;
  storyId: string | null;
  hasUnsavedChanges: boolean;
  
  // Node operations
  addNode: (type: StoryNodeType, position?: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<StoryNodeData>) => void;
  deleteNode: (id: string) => void;
  
  // Bulk operations
  setNodes: (nodes: StoryNode[]) => void;
  setEdges: (edges: StoryEdge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setStoryId: (id: string | null) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  
  // Persistence
  loadCanvas: (storyId: string) => Promise<void>;
  saveCanvas: () => Promise<void>;
  clearCanvas: () => void;
}