import type { Node, Edge } from '@xyflow/react'
import type { Tables } from '#/types/database.types'

export type StoryNode = Tables<'story_nodes'>
export type StoryEdge = Tables<'story_edges'>

export type FlowNode = Node<{
  label: string
  summary?: string | null
  location?: string | null
  timeline_order?: number | null
}>

export type FlowEdge = Edge<{
  label?: string | null
}>

export function storyNodeToFlowNode(node: StoryNode): FlowNode {
  return {
    id: node.id,
    type: 'storyNode',
    position: { x: node.position_x, y: node.position_y },
    data: {
      label: node.title,
      summary: node.summary,
      location: node.location,
      timeline_order: node.timeline_order,
    },
  }
}

export function storyEdgeToFlowEdge(edge: StoryEdge): FlowEdge {
  return {
    id: edge.id,
    source: edge.source_node_id || '',
    target: edge.target_node_id || '',
    label: edge.label || undefined,
    data: {
      label: edge.label,
    },
  }
}
