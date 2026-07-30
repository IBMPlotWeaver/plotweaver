import type { Node, Edge } from '@xyflow/react';

/** The node types available on the story canvas */
export type StoryNodeType = 
  | 'storyBeat' 
  | 'character' 
  | 'worldRule'
  | 'location'
  | 'object'
  | 'event'
  | 'conflict'
  | 'goal'
  | 'secret'
  | 'thread';

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
  traits?: string[];
  goals?: string[]; // IDs of goals
  secrets?: string[]; // IDs of secrets
  arcStage?: string;
  voiceNotes?: string;
}

/** WorldRuleNode data - Maps to world_rules table */
export interface WorldRuleNodeData extends BaseNodeData {
  type: 'worldRule';
  title: string;
  description: string;
}

/** LocationNode data - Maps to locations table */
export interface LocationNodeData extends BaseNodeData {
  type: 'location';
  name: string;
  description: string;
  connectedLocations?: string[];
}

/** ObjectNode data - Maps to objects table */
export interface ObjectNodeData extends BaseNodeData {
  type: 'object';
  name: string;
  properties?: any;
  currentOwner?: string; // Character ID
  currentLocation?: string; // Location ID
  significance?: string;
}

/** EventNode data - Maps to events table */
export interface EventNodeData extends BaseNodeData {
  type: 'event';
  description: string;
  timelinePosition?: number;
  participants?: string[];
  consequences?: string;
}

/** ConflictNode data - Maps to conflicts table */
export interface ConflictNodeData extends BaseNodeData {
  type: 'conflict';
  parties?: string[];
  stakes?: string;
  resolutionStatus?: string;
}

/** GoalNode data - Maps to goals table */
export interface GoalNodeData extends BaseNodeData {
  type: 'goal';
  owningCharacterId?: string;
  status?: string;
  obstacles?: string;
}

/** SecretNode data - Maps to secrets table */
export interface SecretNodeData extends BaseNodeData {
  type: 'secret';
  holderId?: string;
  content: string;
  knownBy?: string[];
  revealStatus?: string;
}

/** ThreadNode data - Maps to threads table */
export interface ThreadNodeData extends BaseNodeData {
  type: 'thread';
  description: string;
  resolutionStatus?: string;
  lastReferencedEventId?: string;
}

/** Union type of all node data types */
export type StoryNodeData = 
  | StoryBeatNodeData 
  | CharacterNodeData 
  | WorldRuleNodeData
  | LocationNodeData
  | ObjectNodeData
  | EventNodeData
  | ConflictNodeData
  | GoalNodeData
  | SecretNodeData
  | ThreadNodeData;

/** A React Flow node extended with PlotWeaver data */
export type StoryNode = Node<StoryNodeData, StoryNodeType>;

/** A React Flow edge connecting two story nodes - Maps to story_edges table */
export interface StoryEdge extends Edge {
  data?: {
    type?: string;
    trustLevel?: number;
    history?: string;
    status?: string;
  };
}

/** Shape of the Zustand canvas store */
export interface CanvasState {
  nodes: StoryNode[];
  edges: StoryEdge[];
  selectedNodeId: string | null;
  storyId: string | null;
  hasUnsavedChanges: boolean;
  lastEditedNodeId: string | null;
  lastEditedTimestamp: number | null;
  
  // Node operations
  addNode: (type: StoryNodeType, position?: { x: number; y: number }, data?: Partial<StoryNodeData>) => void;
  updateNodeData: (id: string, data: Partial<StoryNodeData>, skipEditTracking?: boolean) => void;
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