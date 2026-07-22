import { ReactFlow, Background, BackgroundVariant, Handle, Position } from '@xyflow/react';
import type { Node, Edge } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { BookOpen, User, Shield, MapPin } from 'lucide-react';

// Story Beat Node - mirrors actual StoryBeatNode
function DemoBeatNode({ data }: { data: { label: string; summary: string; location: string; order: number } }) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! border-2! border-violet-500! bg-[var(--surface)]!"
      />
      <div className="w-64 flex flex-col rounded-2xl border border-[var(--line)] shadow-md bg-[var(--surface)]">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-[var(--line)]">
          <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="flex-1 text-sm font-semibold text-[var(--sea-ink)] truncate">
            {data.label}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
            #{data.order}
          </span>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex-1">
          <p className="text-xs text-[var(--sea-ink-soft)] leading-relaxed line-clamp-2">
            {data.summary}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 px-4 pb-3 pt-2 border-t border-[var(--line)]">
          <MapPin className="w-3 h-3 text-[var(--sea-ink-soft)] shrink-0" />
          <span className="text-xs text-[var(--sea-ink-soft)] truncate">
            {data.location}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! border-2! border-violet-500! bg-[var(--surface)]!"
      />
    </>
  );
}

// Character Node - mirrors actual CharacterNode
function DemoCharacterNode({ data }: { data: { label: string; description: string } }) {
  return (
    <div className="w-56 flex flex-col rounded-2xl border border-[var(--line)] shadow-md bg-[var(--surface)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-[var(--line)]">
        <div className="w-8 h-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/40 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
        </div>
        <span className="flex-1 text-sm font-semibold text-[var(--sea-ink)] truncate">
          {data.label}
        </span>
        <span className="text-[10px] uppercase tracking-widest font-bold text-fuchsia-500">
          CHAR
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-xs text-[var(--sea-ink-soft)] leading-relaxed line-clamp-3">
          {data.description}
        </p>
      </div>
    </div>
  );
}

// World Rule Node - mirrors actual WorldRuleNode
function DemoRuleNode({ data }: { data: { label: string; description: string } }) {
  return (
    <div className="w-60 flex flex-col rounded-2xl border-2 border-violet-400 dark:border-violet-600 shadow-md" style={{
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)',
    }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b-2 border-violet-400 dark:border-violet-600">
        <div className="w-8 h-8 rounded-lg bg-violet-500 dark:bg-violet-600 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="flex-1 text-sm font-semibold text-[var(--sea-ink)] truncate">
          {data.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-xs text-[var(--sea-ink-soft)] leading-relaxed line-clamp-2">
          {data.description}
        </p>
      </div>

      {/* Badge */}
      <div className="px-4 pb-3">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[10px] font-medium">
          <Shield className="w-3 h-3" />
          <span>World Rule</span>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  beat: DemoBeatNode,
  character: DemoCharacterNode,
  rule: DemoRuleNode,
};

const demoNodes: Node[] = [
  {
    id: '1',
    type: 'beat',
    position: { x: 20, y: 20 },
    data: {
      label: 'The Discovery',
      summary: 'Elena finds an ancient artifact in the ruins, triggering a chain of events.',
      location: 'Ancient Ruins',
      order: 1
    },
  },
  {
    id: '2',
    type: 'beat',
    position: { x: 320, y: 20 },
    data: {
      label: 'The Confrontation',
      summary: 'Marcus challenges Elena for the artifact, revealing his true intentions.',
      location: 'City Square',
      order: 2
    },
  },
  {
    id: '3',
    type: 'beat',
    position: { x: 620, y: 20 },
    data: {
      label: 'The Resolution',
      summary: 'Elena must choose between power and protecting those she loves.',
      location: 'The Citadel',
      order: 3
    },
  },
  {
    id: '4',
    type: 'character',
    position: { x: 100, y: 200 },
    data: {
      label: 'Commander Elena',
      description: 'A skilled warrior torn between duty and destiny. Haunted by her past.'
    },
  },
  {
    id: '5',
    type: 'character',
    position: { x: 400, y: 200 },
    data: {
      label: 'Marcus Blackwood',
      description: 'A mysterious figure with hidden motives. Seeks the artifact for unknown reasons.'
    },
  },
  {
    id: '6',
    type: 'rule',
    position: { x: 250, y: 350 },
    data: {
      label: 'Magic Costs Life Force',
      description: 'Every use of magic drains the user\'s life energy. Powerful spells can be fatal.'
    },
  },
];

const demoEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
];

export function DemoCanvas() {
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={demoNodes}
        edges={demoEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={true}
        panOnDrag={true}
        minZoom={0.57}
        maxZoom={1.5}
        translateExtent={[[-10, -50], [900, 600]]}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="var(--line)"
        />
      </ReactFlow>
    </div>
  );
}
