import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection, NodeChange, EdgeChange } from '@xyflow/react';
import type { CanvasState, StoryNode, StoryEdge, StoryNodeType, StoryNodeData } from '#/features/canvas/types/canvas.types';

let _nodeIdCounter = 1;
const nextId = () => `node_${Date.now()}_${_nodeIdCounter++}`;

const DEFAULT_NODE_DATA: Record<StoryNodeType, StoryNodeData> = {
  scene: { type: 'scene', title: 'New Scene', content: 'Describe this scene...', tags: [] },
  character: { type: 'character', title: 'New Character', content: 'Describe this character...', tags: [] },
  event: { type: 'event', title: 'New Event', content: 'What happens here?', tags: [] },
};

/** Zustand store managing nodes, edges, and selection state for the story canvas. */
export const useCanvasStore = create<
  CanvasState & {
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
  }
>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) as StoryNode[] }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) =>
    set({ edges: addEdge({ ...connection, animated: true, style: { strokeWidth: 2 } }, get().edges) }),

  addNode: (type, position = { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 }) => {
    const newNode: StoryNode = {
      id: nextId(),
      type,
      position,
      data: { ...DEFAULT_NODE_DATA[type] },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (id, data) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }),

  deleteNode: (id) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    }),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));
