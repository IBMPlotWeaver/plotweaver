import { create } from 'zustand'
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import type { Connection, NodeChange, EdgeChange } from '@xyflow/react'
import type {
  CanvasState,
  StoryNode,
  StoryEdge,
  StoryNodeType,
  StoryNodeData,
  StoryBeatNodeData,
  CharacterNodeData,
  WorldRuleNodeData,
} from '#/features/canvas/types/canvas.types'
import { supabase } from '#/lib/supabase'

// Generate valid v4 UUIDs for Postgres compatibility
const nextId = () => crypto.randomUUID()

const DEFAULT_NODE_DATA: Record<StoryNodeType, StoryNodeData> = {
  storyBeat: {
    type: 'storyBeat',
    title: 'New Story Beat',
    summary: 'Describe what happens in this beat...',
    location: '',
    timelineOrder: 0,
    characterNames: [],
    hasAIWarning: false,
  } as StoryBeatNodeData,
  character: {
    type: 'character',
    name: 'New Character',
    description: 'Describe this character...',
    role: 'Character',
  } as CharacterNodeData,
  worldRule: {
    type: 'worldRule',
    title: 'New World Rule',
    description: 'Describe the constraint or rule...',
  } as WorldRuleNodeData,
}

/** Zustand store managing nodes, edges, and selection state for the story canvas. */
export const useCanvasStore = create<
  CanvasState & {
    onNodesChange: (changes: NodeChange[]) => void
    onEdgesChange: (changes: EdgeChange[]) => void
    onConnect: (connection: Connection) => void
  }
>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  storyId: null,
  hasUnsavedChanges: false,

  onNodesChange: (changes) => {
    const isDirty = changes.some(
      (c) => c.type === 'position' || c.type === 'remove' || c.type === 'add',
    )
    set({
      nodes: applyNodeChanges(changes, get().nodes) as StoryNode[],
      ...(isDirty ? { hasUnsavedChanges: true } : {}),
    })
  },

  onEdgesChange: (changes) => {
    const isDirty = changes.some((c) => c.type === 'remove' || c.type === 'add')
    set({
      edges: applyEdgeChanges(changes, get().edges),
      ...(isDirty ? { hasUnsavedChanges: true } : {}),
    })
  },

  onConnect: (connection) =>
    set({
      edges: addEdge(
        {
          ...connection,
          id: crypto.randomUUID(),
          animated: true,
          style: { strokeWidth: 2 },
        },
        get().edges,
      ),
      hasUnsavedChanges: true,
    }),

  addNode: (
    type,
    position = { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 },
  ) => {
    const nodes = get().nodes

    // Auto-increment timeline order for storyBeat nodes
    let timelineOrder = 0
    if (type === 'storyBeat') {
      const storyBeatNodes = nodes.filter((n) => n.type === 'storyBeat')
      timelineOrder = storyBeatNodes.length + 1
    }

    const newNode: StoryNode = {
      id: nextId(),
      type,
      position,
      data: {
        ...DEFAULT_NODE_DATA[type],
        ...(type === 'storyBeat' && { timelineOrder }),
      } as StoryNodeData,
    }
    set({ nodes: [...nodes, newNode], hasUnsavedChanges: true })
  },

  updateNodeData: (id, data) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, ...data } as StoryNodeData }
          : n,
      ),
      hasUnsavedChanges: true,
    }),

  deleteNode: (id) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      hasUnsavedChanges: true,
    }),

  setNodes: (nodes) => set({ nodes, hasUnsavedChanges: true }),
  setEdges: (edges) => set({ edges, hasUnsavedChanges: true }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setStoryId: (id) => set({ storyId: id }),
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),

  clearCanvas: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      hasUnsavedChanges: false,
    }),

  /**
   * Load canvas data from Supabase for a given story ID.
   * Fetches story_nodes, characters, world_rules, and story_edges.
   */
  loadCanvas: async (storyId: string) => {
    try {
      set({ storyId })

      // Fetch story nodes (story beats)
      const { data: storyNodes, error: nodesError } = await supabase
        .from('story_nodes')
        .select('*')
        .eq('story_id', storyId)
        .order('timeline_order', { ascending: true })

      if (nodesError) throw nodesError

      // Fetch characters
      const { data: characters, error: charsError } = await supabase
        .from('characters')
        .select('*')
        .eq('story_id', storyId)

      if (charsError) throw charsError

      // Fetch world rules
      const { data: worldRules, error: rulesError } = await supabase
        .from('world_rules')
        .select('*')
        .eq('story_id', storyId)

      if (rulesError) throw rulesError

      // Fetch new phase 1 node types
      const { data: locations, error: locationsError } = await supabase.from('locations').select('*').eq('story_id', storyId)
      if (locationsError) throw locationsError

      const { data: objects, error: objectsError } = await supabase.from('objects').select('*').eq('story_id', storyId)
      if (objectsError) throw objectsError

      const { data: events, error: eventsError } = await supabase.from('events').select('*').eq('story_id', storyId)
      if (eventsError) throw eventsError

      const { data: conflicts, error: conflictsError } = await supabase.from('conflicts').select('*').eq('story_id', storyId)
      if (conflictsError) throw conflictsError

      const { data: goals, error: goalsError } = await supabase.from('goals').select('*').eq('story_id', storyId)
      if (goalsError) throw goalsError

      const { data: secrets, error: secretsError } = await supabase.from('secrets').select('*').eq('story_id', storyId)
      if (secretsError) throw secretsError

      const { data: threads, error: threadsError } = await supabase.from('threads').select('*').eq('story_id', storyId)
      if (threadsError) throw threadsError

      // Fetch edges
      const { data: edges, error: edgesError } = await supabase
        .from('story_edges')
        .select('*')
        .eq('story_id', storyId)

      if (edgesError) throw edgesError

      // Fetch node_characters relationships (scoped to nodes in this story)
      const storyNodeIds = storyNodes?.map((n) => n.id) ?? []
      const { data: nodeCharacters, error: ncError } =
        storyNodeIds.length > 0
          ? await supabase
              .from('node_characters')
              .select('node_id, character_id')
              .in('node_id', storyNodeIds)
          : { data: [], error: null }
      if (ncError) throw ncError

      // Fetch AI insights to check for warnings
      const { data: aiInsights, error: aiError } = await supabase
        .from('ai_insights')
        .select('node_id, status')
        .eq('story_id', storyId)
        .eq('status', 'unresolved')

      if (aiError) throw aiError

      // Build character name lookup
      const charMap = new Map(characters?.map((c) => [c.id, c.name]) || [])

      // Build node-to-characters mapping
      const nodeToChars = new Map<string, string[]>()
      nodeCharacters?.forEach((nc) => {
        const charName = charMap.get(nc.character_id)
        if (charName) {
          const existing = nodeToChars.get(nc.node_id) || []
          nodeToChars.set(nc.node_id, [...existing, charName])
        }
      })

      // Build AI warning lookup
      const aiWarnings = new Set(aiInsights?.map((ai) => ai.node_id) || [])

      // Convert to React Flow nodes
      const nodes: StoryNode[] = [
        ...(storyNodes?.map((node) => ({
          id: node.id,
          type: 'storyBeat' as const,
          position: { x: node.position_x, y: node.position_y },
          data: {
            type: 'storyBeat',
            title: node.title,
            summary: node.summary || '',
            location: node.location || '',
            timelineOrder: node.timeline_order || 0,
            characterNames: nodeToChars.get(node.id) || [],
            hasAIWarning: aiWarnings.has(node.id),
          } as StoryBeatNodeData,
        })) || []),
        ...(characters?.map((char) => ({
          id: char.id,
          type: 'character' as const,
          position: { x: 100, y: 100 }, // Default position, should be stored in future
          data: {
            type: 'character',
            name: char.name,
            description: char.description || '',
          } as CharacterNodeData,
        })) || []),
        ...(worldRules?.map((rule) => ({
          id: rule.id,
          type: 'worldRule' as const,
          position: { x: 100, y: 100 }, // Default position, should be stored in future
          data: {
            type: 'worldRule',
            title: rule.title,
            description: rule.description,
          } as WorldRuleNodeData,
        })) || []),
        ...(locations?.map((loc) => ({
          id: loc.id, type: 'location' as const, position: { x: 100, y: 100 },
          data: { type: 'location', name: loc.name, description: loc.description, connectedLocations: loc.connected_locations || [] } as any,
        })) || []),
        ...(objects?.map((obj) => ({
          id: obj.id, type: 'object' as const, position: { x: 100, y: 100 },
          data: { type: 'object', name: obj.name, properties: obj.properties, currentOwner: obj.current_owner, currentLocation: obj.current_location, significance: obj.significance } as any,
        })) || []),
        ...(events?.map((ev) => ({
          id: ev.id, type: 'event' as const, position: { x: 100, y: 100 },
          data: { type: 'event', description: ev.description, timelinePosition: ev.timeline_position, participants: ev.participants || [], consequences: ev.consequences } as any,
        })) || []),
        ...(conflicts?.map((con) => ({
          id: con.id, type: 'conflict' as const, position: { x: 100, y: 100 },
          data: { type: 'conflict', parties: con.parties || [], stakes: con.stakes, resolutionStatus: con.resolution_status } as any,
        })) || []),
        ...(goals?.map((g) => ({
          id: g.id, type: 'goal' as const, position: { x: 100, y: 100 },
          data: { type: 'goal', owningCharacterId: g.owning_character_id, status: g.status, obstacles: g.obstacles } as any,
        })) || []),
        ...(secrets?.map((s) => ({
          id: s.id, type: 'secret' as const, position: { x: 100, y: 100 },
          data: { type: 'secret', holderId: s.holder_id, content: s.content, knownBy: s.known_by || [], revealStatus: s.reveal_status } as any,
        })) || []),
        ...(threads?.map((th) => ({
          id: th.id, type: 'thread' as const, position: { x: 100, y: 100 },
          data: { type: 'thread', description: th.description, resolutionStatus: th.resolution_status, lastReferencedEventId: th.last_referenced_event_id } as any,
        })) || []),
      ]

      // We no longer convert node_characters into visual edges.
      // Character mentions are extracted from the text in saveCanvas.
      const flowEdges: StoryEdge[] = [
        ...(edges?.map((edge) => ({
          id: edge.id,
          source: edge.source_node_id || '',
          target: edge.target_node_id || '',
          label: edge.label || undefined,
          animated: true,
          style: { strokeWidth: 2, stroke: '#8b5cf6' }, // match violet color of Story Beat nodes
        })) || []),
      ]

      set({ nodes, edges: flowEdges, hasUnsavedChanges: false })
    } catch (error) {
      console.error('Failed to load canvas:', error)
      throw error
    }
  },

  /**
   * Save canvas data to Supabase.
   * Persists story_nodes, characters, world_rules, and story_edges.
   */
  saveCanvas: async () => {
    const { nodes, edges, storyId } = get()
    if (!storyId) {
      throw new Error('No story ID set. Cannot save canvas.')
    }

    try {
      // Separate nodes by type
      const storyBeatNodes = nodes.filter((n) => n.type === 'storyBeat')
      const characterNodes = nodes.filter((n) => n.type === 'character')
      const worldRuleNodes = nodes.filter((n) => n.type === 'worldRule')
      const locationNodes = nodes.filter((n) => n.type === 'location')
      const objectNodes = nodes.filter((n) => n.type === 'object')
      const eventNodes = nodes.filter((n) => n.type === 'event')
      const conflictNodes = nodes.filter((n) => n.type === 'conflict')
      const goalNodes = nodes.filter((n) => n.type === 'goal')
      const secretNodes = nodes.filter((n) => n.type === 'secret')
      const threadNodes = nodes.filter((n) => n.type === 'thread')

      const deleteMissingNodes = async (table: string, currentNodes: any[]) => {
        const currentIds = currentNodes.map(n => n.id);
        if (currentIds.length > 0) {
          const { error } = await supabase.from(table).delete().eq('story_id', storyId).filter('id', 'not.in', `(${currentIds.join(',')})`)
          if (error) throw error
        } else {
          const { error } = await supabase.from(table).delete().eq('story_id', storyId)
          if (error) throw error
        }
      }

      await deleteMissingNodes('story_nodes', storyBeatNodes)
      await deleteMissingNodes('characters', characterNodes)
      await deleteMissingNodes('world_rules', worldRuleNodes)
      await deleteMissingNodes('locations', locationNodes)
      await deleteMissingNodes('objects', objectNodes)
      await deleteMissingNodes('events', eventNodes)
      await deleteMissingNodes('conflicts', conflictNodes)
      await deleteMissingNodes('goals', goalNodes)
      await deleteMissingNodes('secrets', secretNodes)
      await deleteMissingNodes('threads', threadNodes)

      // Upsert story_nodes
      if (storyBeatNodes.length > 0) {
        const { error: nodesError } = await supabase.from('story_nodes').upsert(
          storyBeatNodes.map((node) => {
            const data = node.data as StoryBeatNodeData
            return {
              id: node.id,
              story_id: storyId,
              title: data.title,
              summary: data.summary,
              location: data.location,
              timeline_order: data.timelineOrder,
              position_x: node.position.x,
              position_y: node.position.y,
            }
          }),
        )
        if (nodesError) throw nodesError
      }

      // Upsert characters
      if (characterNodes.length > 0) {
        const { error: charsError } = await supabase.from('characters').upsert(
          characterNodes.map((node) => {
            const data = node.data as CharacterNodeData
            return {
              id: node.id,
              story_id: storyId,
              name: data.name,
              description: data.description,
            }
          }),
        )
        if (charsError) throw charsError
      }

      // Upsert world_rules
      if (worldRuleNodes.length > 0) {
        const { error: rulesError } = await supabase.from('world_rules').upsert(
          worldRuleNodes.map((node) => {
            const data = node.data as WorldRuleNodeData
            return {
              id: node.id,
              story_id: storyId,
              title: data.title,
              description: data.description,
            }
          }),
        )
        if (rulesError) throw rulesError
      }

      if (locationNodes.length > 0) {
        const { error } = await supabase.from('locations').upsert(
          locationNodes.map((node) => {
            const data = node.data as any;
            return { id: node.id, story_id: storyId, name: data.name, description: data.description, connected_locations: data.connectedLocations };
          })
        )
        if (error) throw error;
      }
      if (objectNodes.length > 0) {
        const { error } = await supabase.from('objects').upsert(
          objectNodes.map((node) => {
            const data = node.data as any;
            return { id: node.id, story_id: storyId, name: data.name, properties: data.properties, current_owner: data.currentOwner, current_location: data.currentLocation, significance: data.significance };
          })
        )
        if (error) throw error;
      }
      if (eventNodes.length > 0) {
        const { error } = await supabase.from('events').upsert(
          eventNodes.map((node) => {
            const data = node.data as any;
            return { id: node.id, story_id: storyId, description: data.description, timeline_position: data.timelinePosition, participants: data.participants, consequences: data.consequences };
          })
        )
        if (error) throw error;
      }
      if (conflictNodes.length > 0) {
        const { error } = await supabase.from('conflicts').upsert(
          conflictNodes.map((node) => {
            const data = node.data as any;
            return { id: node.id, story_id: storyId, stakes: data.stakes, parties: data.parties, resolution_status: data.resolutionStatus };
          })
        )
        if (error) throw error;
      }
      if (goalNodes.length > 0) {
        const { error } = await supabase.from('goals').upsert(
          goalNodes.map((node) => {
            const data = node.data as any;
            return { id: node.id, story_id: storyId, owning_character_id: data.owningCharacterId, status: data.status, obstacles: data.obstacles };
          })
        )
        if (error) throw error;
      }
      if (secretNodes.length > 0) {
        const { error } = await supabase.from('secrets').upsert(
          secretNodes.map((node) => {
            const data = node.data as any;
            return { id: node.id, story_id: storyId, holder_id: data.holderId, content: data.content, known_by: data.knownBy, reveal_status: data.revealStatus };
          })
        )
        if (error) throw error;
      }
      if (threadNodes.length > 0) {
        const { error } = await supabase.from('threads').upsert(
          threadNodes.map((node) => {
            const data = node.data as any;
            return { id: node.id, story_id: storyId, description: data.description, resolution_status: data.resolutionStatus, last_referenced_event_id: data.lastReferencedEventId };
          })
        )
        if (error) throw error;
      }

      // Sync edges (beat-to-beat)
      const beatToBeatEdges = edges.filter((e) => {
        const sourceNode = nodes.find((n) => n.id === e.source)
        return sourceNode?.type === 'storyBeat'
      })

      // Extract char-to-beat mappings by scanning text for @CharacterName
      const charToBeatEdges: { source: string; target: string }[] = []
      storyBeatNodes.forEach((beat) => {
        const beatData = beat.data as StoryBeatNodeData
        const text = `${beatData.title} ${beatData.summary}`.toLowerCase()
        characterNodes.forEach((char) => {
          const charData = char.data as CharacterNodeData
          if (text.includes(`@${charData.name.toLowerCase()}`)) {
            charToBeatEdges.push({ source: char.id, target: beat.id })
          }
        })
      })

      // 1. Sync story_edges (Clear old, insert current)
      const { error: deleteEdgesError } = await supabase
        .from('story_edges')
        .delete()
        .eq('story_id', storyId)
      if (deleteEdgesError) throw deleteEdgesError

      if (beatToBeatEdges.length > 0) {
        const { error: insertEdgesError } = await supabase
          .from('story_edges')
          .insert(
            beatToBeatEdges.map((edge) => ({
              id: edge.id,
              story_id: storyId,
              source_node_id: edge.source,
              target_node_id: edge.target,
              label: edge.label || null,
            })),
          )
        if (insertEdgesError) throw insertEdgesError
      }

      // 2. Sync node_characters (Clear old for these story beats, insert current)
      if (storyBeatNodes.length > 0) {
        const storyBeatIds = storyBeatNodes.map((n) => n.id)
        const { error: deleteNcError } = await supabase
          .from('node_characters')
          .delete()
          .in('node_id', storyBeatIds)
        if (deleteNcError) throw deleteNcError
      }

      if (charToBeatEdges.length > 0) {
        const { error: insertNcError } = await supabase
          .from('node_characters')
          .insert(
            charToBeatEdges.map((edge) => ({
              character_id: edge.source,
              node_id: edge.target,
            })),
          )
        if (insertNcError) throw insertNcError
      }

      set({ hasUnsavedChanges: false })
      console.log('Canvas saved successfully')
    } catch (error) {
      console.error('Failed to save canvas:', error)
      throw error
    }
  },
}))
