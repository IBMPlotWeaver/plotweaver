import { useState } from 'react';
import { Button } from '#/features/shadcn/components/ui/button';
import { Input } from '#/features/shadcn/components/ui/input';
import { BookOpen, User, Shield, X, Plus, Trash2, Sparkles, ArrowRight, MapPin, Package, Clock, Swords, Target, EyeOff, Activity } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '#/lib/supabase';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
}

interface QuickNode {
  id: string;
  type: 'storyBeat' | 'character' | 'worldRule' | 'location' | 'object' | 'event' | 'conflict' | 'goal' | 'secret' | 'thread';
  title: string;
  description: string;
  location?: string;
  characterIds?: string[];
}

export function QuickCreateModal({ isOpen, onClose, storyId }: QuickCreateModalProps) {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<QuickNode[]>([]);
  const [activeTab, setActiveTab] = useState<'storyBeat' | 'character' | 'worldRule' | 'location' | 'object' | 'event' | 'conflict' | 'goal' | 'secret' | 'thread'>('storyBeat');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { type: 'storyBeat' as const, label: 'Story Beats', icon: BookOpen, color: 'violet' },
    { type: 'character' as const, label: 'Characters', icon: User, color: 'fuchsia' },
    { type: 'worldRule' as const, label: 'World Rules', icon: Shield, color: 'indigo' },
    { type: 'location' as const, label: 'Locations', icon: MapPin, color: 'emerald' },
    { type: 'object' as const, label: 'Objects', icon: Package, color: 'amber' },
    { type: 'event' as const, label: 'Events', icon: Clock, color: 'blue' },
    { type: 'conflict' as const, label: 'Conflicts', icon: Swords, color: 'rose' },
    { type: 'goal' as const, label: 'Goals', icon: Target, color: 'orange' },
    { type: 'secret' as const, label: 'Secrets', icon: EyeOff, color: 'slate' },
    { type: 'thread' as const, label: 'Threads', icon: Activity, color: 'cyan' },
  ];

  const handleAddNode = () => {
    if (!title.trim()) return;

    const newNode: QuickNode = {
      id: crypto.randomUUID(),
      type: activeTab,
      title: title.trim(),
      description: description.trim(),
      ...(activeTab === 'storyBeat' && {
        location: location.trim(),
        characterIds: selectedCharacterIds,
      }),
    };

    setNodes([...nodes, newNode]);
    setTitle('');
    setDescription('');
    setLocation('');
    setSelectedCharacterIds([]);
  };

  const handleRemoveNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id));
  };

  const handleSkip = () => {
    navigate({ to: '/canvas/$storyId', params: { storyId } });
    onClose();
  };

  const handleFinish = async () => {
    if (nodes.length === 0) {
      handleSkip();
      return;
    }

    setIsSaving(true);
    try {
      // Separate nodes by type
      const storyBeats = nodes.filter((n) => n.type === 'storyBeat');
      const characters = nodes.filter((n) => n.type === 'character');
      const worldRules = nodes.filter((n) => n.type === 'worldRule');

      // Insert story beats
      if (storyBeats.length > 0) {
        const { error: beatsError } = await supabase.from('story_nodes').insert(
          storyBeats.map((node, index) => ({
            id: node.id,
            story_id: storyId,
            title: node.title,
            summary: node.description,
            location: node.location || null,
            timeline_order: index + 1,
            position_x: 200 + index * 350,
            position_y: 200,
          }))
        );
        if (beatsError) throw beatsError;

        // Create edges between consecutive story beats
        if (storyBeats.length > 1) {
          const edges = storyBeats.slice(0, -1).map((node, index) => ({
            id: crypto.randomUUID(),
            story_id: storyId,
            source_node_id: node.id,
            target_node_id: storyBeats[index + 1].id,
            label: null,
          }));

          const { error: edgesError } = await supabase.from('story_edges').insert(edges);
          if (edgesError) throw edgesError;
        }

        // Create node_characters relationships
        const nodeCharacterRelations = storyBeats
          .filter((node) => node.characterIds && node.characterIds.length > 0)
          .flatMap((node) =>
            node.characterIds!.map((charId) => ({
              node_id: node.id,
              character_id: charId,
            }))
          );

        if (nodeCharacterRelations.length > 0) {
          const { error: ncError } = await supabase.from('node_characters').insert(nodeCharacterRelations);
          if (ncError) throw ncError;
        }
      }

      // Insert characters
      if (characters.length > 0) {
        const { error: charsError } = await supabase.from('characters').insert(
          characters.map((node) => ({
            id: node.id,
            story_id: storyId,
            name: node.title,
            description: node.description,
          }))
        );
        if (charsError) throw charsError;
      }

      // Insert world rules
      if (worldRules.length > 0) {
        const { error: rulesError } = await supabase.from('world_rules').insert(
          worldRules.map((node) => ({
            id: node.id,
            story_id: storyId,
            title: node.title,
            description: node.description,
          }))
        );
        if (rulesError) throw rulesError;
      }

      const locations = nodes.filter((n) => n.type === 'location');
      const objects = nodes.filter((n) => n.type === 'object');
      const events = nodes.filter((n) => n.type === 'event');
      const conflicts = nodes.filter((n) => n.type === 'conflict');
      const goals = nodes.filter((n) => n.type === 'goal');
      const secrets = nodes.filter((n) => n.type === 'secret');
      const threads = nodes.filter((n) => n.type === 'thread');

      if (locations.length > 0) {
        const { error } = await supabase.from('locations').insert(
          locations.map((n) => ({ id: n.id, story_id: storyId, name: n.title, description: n.description }))
        );
        if (error) throw error;
      }
      if (objects.length > 0) {
        const { error } = await supabase.from('objects').insert(
          objects.map((n) => ({ id: n.id, story_id: storyId, name: n.title, properties: n.description }))
        );
        if (error) throw error;
      }
      if (events.length > 0) {
        const { error } = await supabase.from('events').insert(
          events.map((n) => ({ id: n.id, story_id: storyId, description: n.title, consequences: n.description }))
        );
        if (error) throw error;
      }
      if (conflicts.length > 0) {
        const { error } = await supabase.from('conflicts').insert(
          conflicts.map((n) => ({ id: n.id, story_id: storyId, stakes: n.title, resolution_status: n.description }))
        );
        if (error) throw error;
      }
      if (goals.length > 0) {
        const { error } = await supabase.from('goals').insert(
          goals.map((n) => ({ id: n.id, story_id: storyId, status: n.title, obstacles: n.description }))
        );
        if (error) throw error;
      }
      if (secrets.length > 0) {
        const { error } = await supabase.from('secrets').insert(
          secrets.map((n) => ({ id: n.id, story_id: storyId, content: n.title, reveal_status: n.description }))
        );
        if (error) throw error;
      }
      if (threads.length > 0) {
        const { error } = await supabase.from('threads').insert(
          threads.map((n) => ({ id: n.id, story_id: storyId, description: n.title, resolution_status: n.description }))
        );
        if (error) throw error;
      }

      // Navigate to canvas
      navigate({ to: '/canvas/$storyId', params: { storyId } });
      onClose();
    } catch (error) {
      console.error('Failed to create nodes:', error);
      alert('Failed to create nodes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentTabNodes = nodes.filter((n) => n.type === activeTab);
  const currentTab = tabs.find((t) => t.type === activeTab)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="island-shell rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-(--sea-ink)">Quick Create Nodes</h2>
              <p className="text-xs text-(--sea-ink-soft)">Add story elements to get started</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg text-(--sea-ink-soft) hover:bg-(--line) transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-(--line) pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.type;
            const count = nodes.filter((n) => n.type === tab.type).length;

            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? `bg-${tab.color}-100 dark:bg-${tab.color}-900/40 text-${tab.color}-700 dark:text-${tab.color}-300`
                    : 'text-(--sea-ink-soft) hover:bg-(--line)'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? `bg-${tab.color}-200 dark:bg-${tab.color}-800 text-${tab.color}-800 dark:text-${tab.color}-200`
                      : 'bg-(--line) text-(--sea-ink-soft)'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4">
          {/* Add form */}
          <div className="space-y-3 p-4 rounded-xl bg-(--line)/30">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activeTab === 'storyBeat'
                  ? 'Story beat title...'
                  : activeTab === 'character'
                  ? 'Character name...'
                  : 'Title or name...'
              }
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim()) {
                  e.preventDefault();
                  handleAddNode();
                }
              }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                activeTab === 'storyBeat'
                  ? 'What happens in this beat...'
                  : activeTab === 'character'
                  ? 'Character description...'
                  : 'Description or details...'
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-(--line) bg-transparent text-(--sea-ink) placeholder:text-(--sea-ink-soft) focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              rows={4}
            />
            {activeTab === 'storyBeat' && (
              <>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-(--line) bg-transparent text-(--sea-ink) focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">Location (optional)...</option>
                  {nodes
                    .filter((n) => n.type === 'location')
                    .map((loc) => (
                      <option key={loc.id} value={loc.title} className="bg-(--surface) text-(--sea-ink)">
                        {loc.title}
                      </option>
                    ))}
                </select>
                {nodes.filter((n) => n.type === 'character').length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-(--sea-ink)">Characters in this beat:</label>
                    <div className="flex flex-wrap gap-2">
                      {nodes
                        .filter((n) => n.type === 'character')
                        .map((char) => {
                          const isSelected = selectedCharacterIds.includes(char.id);
                          return (
                            <button
                              key={char.id}
                              type="button"
                              onClick={() => {
                                setSelectedCharacterIds((prev) =>
                                  isSelected ? prev.filter((id) => id !== char.id) : [...prev, char.id]
                                );
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300 border-2 border-fuchsia-500'
                                  : 'bg-(--line) text-(--sea-ink-soft) border-2 border-transparent hover:border-(--sea-ink-soft)'
                              }`}
                            >
                              {char.title}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </>
            )}
            <Button
              onClick={handleAddNode}
              disabled={!title.trim()}
              className="w-full rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white border-none"
            >
              <Plus className="w-4 h-4" />
              Add {currentTab.label.slice(0, -1)}
            </Button>
          </div>

          {/* List of added nodes */}
          {currentTabNodes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-(--sea-ink-soft) px-1">
                Added {currentTab.label} ({currentTabNodes.length})
              </p>
              {currentTabNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-(--surface) border border-(--line) hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-(--sea-ink) truncate">{node.title}</p>
                    {node.description && (
                      <p className="text-xs text-(--sea-ink-soft) line-clamp-2 mt-1">{node.description}</p>
                    )}
                    {node.type === 'storyBeat' && node.location && (
                      <p className="text-xs text-(--sea-ink-soft) mt-1 flex items-center gap-1">
                        <span className="opacity-60">📍</span>
                        {node.location}
                      </p>
                    )}
                    {node.type === 'storyBeat' && node.characterIds && node.characterIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {node.characterIds.map((charId) => {
                          const character = nodes.find((n) => n.id === charId);
                          return character ? (
                            <span
                              key={charId}
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300"
                            >
                              {character.title}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveNode(node.id)}
                    className="p-1.5 rounded-lg text-(--sea-ink-soft) hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-(--line)">
          <p className="text-xs text-(--sea-ink-soft)">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''} ready to create
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="rounded-xl"
              disabled={isSaving}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleFinish}
              disabled={isSaving}
              className="rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white border-none shadow-lg shadow-violet-500/20"
            >
              {isSaving ? (
                'Creating...'
              ) : (
                <>
                  {nodes.length > 0 ? 'Create & Open Canvas' : 'Open Canvas'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
