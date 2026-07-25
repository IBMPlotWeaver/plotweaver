import { useState } from 'react';
import { useReactFlow, Panel } from '@xyflow/react';
import { BookOpen, User, Shield, ChevronRight, PanelLeftOpen, PanelLeftClose, Hash, MapPin, Code, Copy, Check, Layers, Plus, Box, Zap, Swords, Target, Lock, GitMerge } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/features/shadcn/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/features/shadcn/components/ui/dialog';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';
import type { StoryBeatNodeData, StoryNodeType } from '#/features/canvas/types/canvas.types';
import { AddNodeDialog } from './AddNodeDialog';

/**
 * Modal that displays the current canvas nodes and edges as formatted JSON.
 */
function JsonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const { nodes, edges } = useCanvasStore();

  const json = JSON.stringify({ nodes, edges }, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col bg-(--surface) border-(--line) text-(--sea-ink)">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-(--sea-ink)">
            <Code className="w-5 h-5 text-violet-500" />
            Canvas JSON Export
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-(--sea-ink-soft)">
              {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {edges.length} edge{edges.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-md"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
          <div className="relative flex-1 min-h-0">
            <textarea
              readOnly
              wrap="off"
              className="w-full h-full min-h-150 resize-none rounded-xl bg-zinc-950 text-zinc-200 text-xs p-4 leading-relaxed outline-none custom-scrollbar font-mono"
              value={json}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface NodeSection<T> {
  label: string;
  icon: React.ReactNode;
  accentClass: string;
  badgeClass: string;
  bgClass: string;
  borderClass: string;
  nodes: { id: string; data: T }[];
  renderTitle: (data: T) => string;
  renderSub?: (data: T) => string | undefined;
}

/**
 * Sidebar content component - shared between mobile sheet and desktop panel
 */
function NodesSidebarContent({ onItemClick }: { onItemClick: (id: string) => void }) {
  const { nodes, selectedNodeId } = useCanvasStore();
  const [jsonOpen, setJsonOpen] = useState(false);
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [addNodeType, setAddNodeType] = useState<StoryNodeType>('storyBeat');

  const storyBeats = nodes.filter((n) => n.type === 'storyBeat');
  const characters = nodes.filter((n) => n.type === 'character');
  const worldRules = nodes.filter((n) => n.type === 'worldRule');
  const locations = nodes.filter((n) => n.type === 'location');
  const objects = nodes.filter((n) => n.type === 'object');
  const events = nodes.filter((n) => n.type === 'event');
  const conflicts = nodes.filter((n) => n.type === 'conflict');
  const goals = nodes.filter((n) => n.type === 'goal');
  const secrets = nodes.filter((n) => n.type === 'secret');
  const threads = nodes.filter((n) => n.type === 'thread');

  const sections: NodeSection<any>[] = [
    {
      label: 'Story Beats',
      icon: <BookOpen className="w-4 h-4" />,
      accentClass: 'text-violet-600 dark:text-violet-400',
      badgeClass: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
      bgClass: 'bg-violet-50 dark:bg-violet-900/20',
      borderClass: 'border-violet-200 dark:border-violet-800',
      nodes: storyBeats,
      renderTitle: (d) => d.title,
      renderSub: (d) => d.location || undefined,
    },
    {
      label: 'Characters',
      icon: <User className="w-4 h-4" />,
      accentClass: 'text-fuchsia-600 dark:text-fuchsia-400',
      badgeClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300',
      bgClass: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
      borderClass: 'border-fuchsia-200 dark:border-fuchsia-800',
      nodes: characters,
      renderTitle: (d) => d.name,
      renderSub: (d) => d.role || undefined,
    },
    {
      label: 'World Rules',
      icon: <Shield className="w-4 h-4" />,
      accentClass: 'text-indigo-600 dark:text-indigo-400',
      badgeClass: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
      bgClass: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderClass: 'border-indigo-200 dark:border-indigo-800',
      nodes: worldRules,
      renderTitle: (d) => d.title,
    },
    {
      label: 'Locations',
      icon: <MapPin className="w-4 h-4" />,
      accentClass: 'text-teal-600 dark:text-teal-400',
      badgeClass: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
      bgClass: 'bg-teal-50 dark:bg-teal-900/20',
      borderClass: 'border-teal-200 dark:border-teal-800',
      nodes: locations,
      renderTitle: (d) => d.name,
    },
    {
      label: 'Objects',
      icon: <Box className="w-4 h-4" />,
      accentClass: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
      bgClass: 'bg-amber-50 dark:bg-amber-900/20',
      borderClass: 'border-amber-200 dark:border-amber-800',
      nodes: objects,
      renderTitle: (d) => d.name,
    },
    {
      label: 'Events',
      icon: <Zap className="w-4 h-4" />,
      accentClass: 'text-orange-600 dark:text-orange-400',
      badgeClass: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
      bgClass: 'bg-orange-50 dark:bg-orange-900/20',
      borderClass: 'border-orange-200 dark:border-orange-800',
      nodes: events,
      renderTitle: (d) => d.description,
    },
    {
      label: 'Conflicts',
      icon: <Swords className="w-4 h-4" />,
      accentClass: 'text-red-600 dark:text-red-400',
      badgeClass: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      borderClass: 'border-red-200 dark:border-red-800',
      nodes: conflicts,
      renderTitle: (d) => d.stakes,
    },
    {
      label: 'Goals',
      icon: <Target className="w-4 h-4" />,
      accentClass: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
      bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderClass: 'border-emerald-200 dark:border-emerald-800',
      nodes: goals,
      renderTitle: (d) => d.status,
    },
    {
      label: 'Secrets',
      icon: <Lock className="w-4 h-4" />,
      accentClass: 'text-slate-600 dark:text-slate-400',
      badgeClass: 'bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300',
      bgClass: 'bg-slate-50 dark:bg-slate-900/20',
      borderClass: 'border-slate-200 dark:border-slate-800',
      nodes: secrets,
      renderTitle: (d) => d.content,
    },
    {
      label: 'Threads',
      icon: <GitMerge className="w-4 h-4" />,
      accentClass: 'text-blue-600 dark:text-blue-400',
      badgeClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      borderClass: 'border-blue-200 dark:border-blue-800',
      nodes: threads,
      renderTitle: (d) => d.description,
    },
  ];

  const totalCount = nodes.length;

  return (
    <>
      <JsonModal open={jsonOpen} onClose={() => setJsonOpen(false)} />
      <AddNodeDialog
        isOpen={addNodeOpen}
        onClose={() => setAddNodeOpen(false)}
        nodeType={addNodeType}
      />

      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 custom-scrollbar">
          {totalCount === 0 && (
            <div className="flex flex-col items-center justify-center h-32 gap-3 text-center px-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 flex items-center justify-center">
                <Layers className="w-7 h-7 text-violet-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-(--sea-ink)">No nodes yet</p>
                <p className="text-xs text-(--sea-ink-soft) opacity-70 leading-relaxed">
                  Click the + buttons below to add nodes.
                </p>
              </div>
            </div>
          )}
          {sections.map((section) => {
            const typeMap: Record<string, StoryNodeType> = {
              'Story Beats': 'storyBeat',
              'Characters': 'character',
              'World Rules': 'worldRule',
              'Locations': 'location',
              'Objects': 'object',
              'Events': 'event',
              'Conflicts': 'conflict',
              'Goals': 'goal',
              'Secrets': 'secret',
              'Threads': 'thread',
            };

            return (
              <div key={section.label}>
                {/* Section header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={section.accentClass}>{section.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-(--sea-ink)">
                    {section.label}
                  </span>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${section.badgeClass}`}>
                    {section.nodes.length}
                  </span>
                  <button
                    onClick={() => {
                      setAddNodeType(typeMap[section.label]);
                      setAddNodeOpen(true);
                    }}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${section.label === 'Story Beats'
                      ? 'hover:bg-violet-100 dark:hover:bg-violet-900/40'
                      : section.label === 'Characters'
                        ? 'hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40'
                        : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                      }`}
                    title={`Add ${section.label.slice(0, -1)}`}
                  >
                    <Plus className={`w-3.5 h-3.5 ${section.accentClass}`} />
                  </button>
                </div>

                {section.nodes.length === 0 ? (
                  <p className="text-xs text-(--sea-ink-soft) px-3 py-2 opacity-60 italic">None added yet</p>
                ) : (
                  <ul className="space-y-2">
                    {section.nodes.map((node) => {
                      const title = section.renderTitle(node.data);
                      const sub = section.renderSub?.(node.data);
                      const isSelected = selectedNodeId === node.id;

                      return (
                        <li key={node.id}>
                          <button
                            onClick={() => onItemClick(node.id)}
                            className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer border-2 ${isSelected
                              ? `${section.bgClass} ${section.borderClass} shadow-md`
                              : 'hover:bg-(--line) border-transparent hover:border-(--line)'
                              }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold truncate ${isSelected ? section.accentClass : 'text-(--sea-ink)'
                                  }`}
                              >
                                {/* Beat-specific: show timeline order */}
                                {node.data.type === 'storyBeat' && (
                                  <span className={`inline-flex items-center gap-0.5 mr-1.5 text-[10px] font-bold ${section.accentClass}`}>
                                    <Hash className="w-3 h-3" />
                                    {(node.data as StoryBeatNodeData).timelineOrder}
                                  </span>
                                )}
                                {title}
                              </p>
                              {sub && (
                                <p className="text-xs text-(--sea-ink-soft) truncate flex items-center gap-1 mt-1">
                                  {node.data.type === 'storyBeat' && <MapPin className="w-3 h-3 shrink-0" />}
                                  {sub}
                                </p>
                              )}
                            </div>
                            <ChevronRight
                              className={`w-4 h-4 shrink-0 transition-all ${isSelected
                                ? `${section.accentClass} translate-x-0.5`
                                : 'text-(--sea-ink-soft) opacity-0 group-hover:opacity-100'
                                }`}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Export JSON footer */}
        <div className="shrink-0 px-4 py-3 border-t border-(--line)">
          <button
            onClick={() => setJsonOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-(--sea-ink) hover:text-violet-600 dark:hover:text-violet-400 bg-(--surface) hover:bg-violet-50 dark:hover:bg-violet-900/20 border-2 border-(--line) hover:border-violet-200 dark:hover:border-violet-800 transition-all cursor-pointer"
            title="Export canvas as JSON"
          >
            <Code className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Sidebar panel listing all canvas nodes grouped by type.
 * Clicking a node focuses the canvas viewport on it.
 */
export function NodesSidebar() {
  const { nodes, setSelectedNodeId } = useCanvasStore();
  const { fitBounds, getNode } = useReactFlow();
  const [open, setOpen] = useState(false);

  const totalCount = nodes.length;

  const focusNode = (id: string) => {
    const node = getNode(id);
    if (!node) return;
    const { x, y } = node.position;
    const w = node.measured?.width ?? 320;
    const h = node.measured?.height ?? 220;
    const padding = 80;
    fitBounds(
      { x: x - padding, y: y - padding, width: w + padding * 2, height: h + padding * 2 },
      { duration: 500 }
    );
    setSelectedNodeId(id);
  };

  const handleItemClick = (id: string) => {
    focusNode(id);
    // Close sheet on mobile after selection
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <>
      {/* Mobile: Sheet trigger via Panel (bottom-left) */}
      <Panel position="bottom-left" className="md:hidden mb-14 ml-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="island-shell flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-(--sea-ink) shadow-lg hover:shadow-xl transition-all cursor-pointer bg-linear-to-br from-(--surface) to-violet-50 dark:to-violet-900/20 border-2 border-(--line)"
              title="Open node list"
            >
              <Layers className="w-4 h-4" />
              <span>Nodes</span>
              {totalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                  {totalCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 border-(--line) bg-(--surface) flex flex-col">
            <SheetHeader className="px-4 pt-5 pb-3 border-b border-(--line)">
              <SheetTitle className="flex items-center gap-2 text-base text-(--sea-ink)">
                <Layers className="w-5 h-5 text-violet-500" />
                Canvas Nodes
                {totalCount > 0 && (
                  <span className="ml-auto text-sm text-(--sea-ink-soft) font-normal">
                    ({totalCount})
                  </span>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
              <NodesSidebarContent onItemClick={handleItemClick} />
            </div>
          </SheetContent>
        </Sheet>
      </Panel>

      {/* Desktop: Collapsible Panel sidebar (left) */}
      <Panel position="top-left" className="hidden md:flex m-0! p-0! top-0 bottom-0 h-full">
        <DesktopSidebar totalCount={totalCount} onItemClick={handleItemClick} />
      </Panel>
    </>
  );
}

interface DesktopSidebarProps {
  totalCount: number;
  onItemClick: (id: string) => void;
}

function DesktopSidebar({ totalCount, onItemClick }: DesktopSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`flex flex-col h-full transition-all duration-300 ease-in-out ${collapsed ? 'w-14' : 'w-72'
        }`}
    >
      <div className="island-shell h-full flex flex-col rounded-none rounded-r-2xl border-l-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-(--line) shrink-0">
          {!collapsed && (
            <>
              <Layers className="w-5 h-5 text-violet-500 shrink-0" />
              <span className="flex-1 text-sm font-semibold text-(--sea-ink) truncate">
                Canvas Nodes
              </span>
              {totalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                  {totalCount}
                </span>
              )}
            </>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 rounded-lg text-(--sea-ink-soft) hover:bg-(--line) hover:text-(--sea-ink) transition-all cursor-pointer shrink-0 ml-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Content */}
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <NodesSidebarContent onItemClick={onItemClick} />
          </div>
        )}

        {/* Collapsed icons */}
        {collapsed && (
          <div className="flex flex-col items-center gap-4 pt-6">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-500" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-900/20 flex items-center justify-center">
              <User className="w-5 h-5 text-fuchsia-500" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}