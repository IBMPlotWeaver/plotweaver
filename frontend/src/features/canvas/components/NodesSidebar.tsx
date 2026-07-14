import { useState } from 'react';
import { useReactFlow, Panel } from '@xyflow/react';
import { BookOpen, User, Shield, ChevronRight, PanelLeftOpen, PanelLeftClose, Hash, MapPin } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/features/shadcn/components/ui/sheet';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';
import type { StoryBeatNodeData, CharacterNodeData, WorldRuleNodeData } from '#/features/canvas/types/canvas.types';

interface NodeSection<T> {
  label: string;
  icon: React.ReactNode;
  accentClass: string;
  badgeClass: string;
  nodes: { id: string; data: T }[];
  renderTitle: (data: T) => string;
  renderSub?: (data: T) => string | undefined;
}

/**
 * Sidebar panel listing all canvas nodes grouped by type.
 * Clicking a node focuses the canvas viewport on it.
 */
export function NodesSidebar() {
  const { nodes, selectedNodeId, setSelectedNodeId } = useCanvasStore();
  const { fitBounds, getNode } = useReactFlow();
  const [open, setOpen] = useState(false);

  const storyBeats = nodes.filter((n) => n.type === 'storyBeat');
  const characters = nodes.filter((n) => n.type === 'character');
  const worldRules = nodes.filter((n) => n.type === 'worldRule');

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

  const sections: NodeSection<StoryBeatNodeData | CharacterNodeData | WorldRuleNodeData>[] = [
    {
      label: 'Story Beats',
      icon: <BookOpen className="w-4 h-4" />,
      accentClass: 'text-violet-600 dark:text-violet-400',
      badgeClass: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
      nodes: storyBeats as { id: string; data: StoryBeatNodeData }[],
      renderTitle: (d) => (d as StoryBeatNodeData).title,
      renderSub: (d) => (d as StoryBeatNodeData).location || undefined,
    },
    {
      label: 'Characters',
      icon: <User className="w-4 h-4" />,
      accentClass: 'text-fuchsia-600 dark:text-fuchsia-400',
      badgeClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300',
      nodes: characters as { id: string; data: CharacterNodeData }[],
      renderTitle: (d) => (d as CharacterNodeData).name,
      renderSub: (d) => (d as CharacterNodeData).role || undefined,
    },
    {
      label: 'World Rules',
      icon: <Shield className="w-4 h-4" />,
      accentClass: 'text-indigo-600 dark:text-indigo-400',
      badgeClass: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
      nodes: worldRules as { id: string; data: WorldRuleNodeData }[],
      renderTitle: (d) => (d as WorldRuleNodeData).title,
    },
  ];

  const totalCount = nodes.length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 custom-scrollbar">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
            <p className="text-sm text-(--sea-ink-soft)">No nodes yet.</p>
            <p className="text-xs text-(--sea-ink-soft) opacity-70">Add nodes from the toolbar above.</p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.label}>
              {/* Section header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className={section.accentClass}>{section.icon}</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-(--sea-ink-soft)">
                  {section.label}
                </span>
                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${section.badgeClass}`}>
                  {section.nodes.length}
                </span>
              </div>

              {section.nodes.length === 0 ? (
                <p className="text-xs text-(--sea-ink-soft) px-2 py-1 opacity-60">None added yet</p>
              ) : (
                <ul className="space-y-1">
                  {section.nodes.map((node) => {
                    const title = section.renderTitle(node.data);
                    const sub = section.renderSub?.(node.data);
                    const isSelected = selectedNodeId === node.id;

                    return (
                      <li key={node.id}>
                        <button
                          onClick={() => handleItemClick(node.id)}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer ${isSelected
                            ? 'bg-violet-100 dark:bg-violet-900/40 border border-violet-300 dark:border-violet-700'
                            : 'hover:bg-(--line) border border-transparent'
                            }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-(--sea-ink)'
                                }`}
                            >
                              {/* Beat-specific: show timeline order */}
                              {node.data.type === 'storyBeat' && (
                                <span className="inline-flex items-center gap-0.5 mr-1 text-[10px] font-bold text-violet-500">
                                  <Hash className="w-2.5 h-2.5" />
                                  {(node.data as StoryBeatNodeData).timelineOrder}
                                </span>
                              )}
                              {title}
                            </p>
                            {sub && (
                              <p className="text-xs text-(--sea-ink-soft) truncate flex items-center gap-1 mt-0.5">
                                {node.data.type === 'storyBeat' && <MapPin className="w-2.5 h-2.5 shrink-0" />}
                                {sub}
                              </p>
                            )}
                          </div>
                          <ChevronRight
                            className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected
                              ? 'text-violet-500 translate-x-0.5'
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
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet trigger via Panel (bottom-left) */}
      <Panel position="bottom-left" className="md:hidden mb-14">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="island-shell flex items-center gap-2 px-3 py-2.5 rounded-full text-sm font-medium text-(--sea-ink) shadow-lg transition-colors cursor-pointer"
              title="Open node list"
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span>Nodes ({totalCount})</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-(--line) bg-(--surface) flex flex-col">
            <SheetHeader className="px-4 pt-5 pb-3 border-b border-(--line)">
              <SheetTitle className="text-base text-(--sea-ink)">Canvas Nodes</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </Panel>

      {/* Desktop: Collapsible Panel sidebar (left) */}
      <Panel position="top-left" className="hidden md:flex m-0! p-0! top-0 bottom-0 h-full">
        <DesktopSidebar totalCount={totalCount} selectedNodeId={selectedNodeId}>
          <SidebarContent />
        </DesktopSidebar>
      </Panel>
    </>
  );
}

interface DesktopSidebarProps {
  totalCount: number;
  selectedNodeId: string | null;
  children: React.ReactNode;
}

function DesktopSidebar({ totalCount, children }: DesktopSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`flex flex-col h-screen transition-all duration-300 ease-in-out ${collapsed ? 'w-12' : 'w-64'
        }`}
    >
      <div className="island-shell h-full flex flex-col rounded-none rounded-r-2xl border-l-0 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-(--line) shrink-0">
          {!collapsed && (
            <span className="flex-1 text-sm font-semibold text-(--sea-ink) truncate">
              Nodes <span className="text-(--sea-ink-soft) font-normal">({totalCount})</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-[var(--sea-ink-soft) hover:bg-[var(--line) transition-colors cursor-pointer shrink-0 ml-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Content */}
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        )}

        {/* Collapsed icons */}
        {collapsed && (
          <div className="flex flex-col items-center gap-3 pt-4">
            <BookOpen className="w-4 h-4 text-violet-500" />
            <User className="w-4 h-4 text-fuchsia-500" />
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
        )}
      </div>
    </div>
  );
}
