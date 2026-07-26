import dagre from '@dagrejs/dagre';
import type { StoryNode, StoryEdge } from '#/features/canvas/types/canvas.types';

/** Default dimensions used when a node hasn't been measured yet by React Flow. */
const DEFAULT_NODE_WIDTH = 320;
const DEFAULT_NODE_HEIGHT = 220;

/** Gap between nodes in the layout. */
const NODE_SEPARATION = 60;
const RANK_SEPARATION = 100;

/**
 * Computes a non-overlapping layout for all canvas nodes using the Dagre
 * hierarchical graph layout algorithm.
 *
 * Story beats are arranged in a left-to-right hierarchy following their edges.
 * Characters and world rules are placed in rows below the story beat layer,
 * since they have no directional edges connecting them.
 *
 * @param nodes - Current React Flow nodes
 * @param edges - Current React Flow edges (beat-to-beat only)
 * @returns A new node array with updated `position` values
 */
export function computeAutoLayout(nodes: StoryNode[], edges: StoryEdge[]): StoryNode[] {
  // Separate node types
  const beatNodes = nodes.filter((n) => n.type === 'storyBeat');
  const characterNodes = nodes.filter((n) => n.type === 'character');
  const worldRuleNodes = nodes.filter((n) => n.type === 'worldRule');

  // --- Layout story beats via Dagre (left-to-right) ---
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: 'LR',
    nodesep: NODE_SEPARATION,
    ranksep: RANK_SEPARATION,
    marginx: 40,
    marginy: 40,
  });

  beatNodes.forEach((node) => {
    graph.setNode(node.id, {
      width: node.measured?.width ?? DEFAULT_NODE_WIDTH,
      height: node.measured?.height ?? DEFAULT_NODE_HEIGHT,
    });
  });

  // Only include beat-to-beat edges in the Dagre graph
  edges.forEach((edge) => {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(graph);

  // Extract Dagre-computed positions for beats
  const laidOutBeats: StoryNode[] = beatNodes.map((node) => {
    const { x, y } = graph.node(node.id);
    const w = node.measured?.width ?? DEFAULT_NODE_WIDTH;
    const h = node.measured?.height ?? DEFAULT_NODE_HEIGHT;
    return { ...node, position: { x: x - w / 2, y: y - h / 2 } };
  });

  // Determine the bottom edge of the beat layer so characters/rules go below
  const beatBottom =
    laidOutBeats.length > 0
      ? Math.max(...laidOutBeats.map((n) => n.position.y + (n.measured?.height ?? DEFAULT_NODE_HEIGHT)))
      : 0;

  const otherNodes = nodes.filter((n) => n.type !== 'storyBeat');
  
  // Group other nodes by type dynamically to have consistent rows for each type
  const typesSet = new Set(otherNodes.map(n => n.type));
  // Sort types: character first, worldRule second, then alphabetical
  const sortedTypes = Array.from(typesSet).sort((a, b) => {
    if (a === 'character') return -1;
    if (b === 'character') return 1;
    if (a === 'worldRule') return -1;
    if (b === 'worldRule') return 1;
    return (a || '').localeCompare(b || '');
  });

  const laidOutOthers: StoryNode[] = [];
  let currentRowY = beatBottom + RANK_SEPARATION;
  const nodeWidth = DEFAULT_NODE_WIDTH;
  const nodeHeight = DEFAULT_NODE_HEIGHT;

  for (const type of sortedTypes) {
    const typeNodes = otherNodes.filter(n => n.type === type);
    if (typeNodes.length > 0) {
      const positioned = typeNodes.map((node, i) => ({
        ...node,
        position: {
          x: i * (nodeWidth + NODE_SEPARATION) + 40,
          y: currentRowY,
        },
      }));
      laidOutOthers.push(...positioned);
      currentRowY += nodeHeight + RANK_SEPARATION;
    }
  }

  return [...laidOutBeats, ...laidOutOthers];
}
