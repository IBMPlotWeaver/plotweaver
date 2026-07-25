import { useState } from 'react';
import { Button } from '#/features/shadcn/components/ui/button';
import { Input } from '#/features/shadcn/components/ui/input';
import { BookOpen, User, Shield, Plus, MapPin, Box, Zap, Swords, Target, Lock, GitMerge } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/features/shadcn/components/ui/dialog';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';
import type { StoryNodeType } from '#/features/canvas/types/canvas.types';

interface AddNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodeType: StoryNodeType;
}

const nodeConfig = {
  storyBeat: {
    label: 'Story Beat',
    icon: BookOpen,
    color: 'violet',
    titlePlaceholder: 'Story beat title...',
    descPlaceholder: 'What happens in this beat...',
    titleLabel: 'Title',
    descLabel: 'Summary',
  },
  character: {
    label: 'Character',
    icon: User,
    color: 'fuchsia',
    titlePlaceholder: 'Character name...',
    descPlaceholder: 'Character description...',
    titleLabel: 'Name',
    descLabel: 'Description',
  },
  worldRule: {
    label: 'World Rule',
    icon: Shield,
    color: 'violet',
    titlePlaceholder: 'World rule title...',
    descPlaceholder: 'Rule description...',
    titleLabel: 'Title',
    descLabel: 'Description',
  },
  location: {
    label: 'Location',
    icon: MapPin,
    color: 'teal',
    titlePlaceholder: 'Location name...',
    descPlaceholder: 'Description of the location...',
    titleLabel: 'Name',
    descLabel: 'Description',
  },
  object: {
    label: 'Object',
    icon: Box,
    color: 'amber',
    titlePlaceholder: 'Object name...',
    descPlaceholder: 'Why is this important?...',
    titleLabel: 'Name',
    descLabel: 'Significance',
  },
  event: {
    label: 'Event',
    icon: Zap,
    color: 'orange',
    titlePlaceholder: 'Event description...',
    descPlaceholder: 'Consequences...',
    titleLabel: 'Description',
    descLabel: 'Consequences',
  },
  conflict: {
    label: 'Conflict',
    icon: Swords,
    color: 'red',
    titlePlaceholder: 'Conflict stakes...',
    descPlaceholder: 'Status (e.g. Unresolved)...',
    titleLabel: 'Stakes',
    descLabel: 'Status',
  },
  goal: {
    label: 'Goal',
    icon: Target,
    color: 'emerald',
    titlePlaceholder: 'Goal / Status...',
    descPlaceholder: 'Obstacles...',
    titleLabel: 'Status',
    descLabel: 'Obstacles',
  },
  secret: {
    label: 'Secret',
    icon: Lock,
    color: 'slate',
    titlePlaceholder: 'Secret content...',
    descPlaceholder: 'Reveal Status...',
    titleLabel: 'Content',
    descLabel: 'Reveal Status',
  },
  thread: {
    label: 'Thread',
    icon: GitMerge,
    color: 'blue',
    titlePlaceholder: 'Thread description...',
    descPlaceholder: 'Status...',
    titleLabel: 'Description',
    descLabel: 'Status',
  },
};

export function AddNodeDialog({ isOpen, onClose, nodeType }: AddNodeDialogProps) {
  const { addNode, nodes } = useCanvasStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);

  const config = nodeConfig[nodeType];
  const Icon = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Add node to canvas
    addNode(nodeType);

    // Get the newly added node and update its data
    const nodes = useCanvasStore.getState().nodes;
    const newNode = nodes[nodes.length - 1];

    if (newNode) {
      const updateData: any = {};

      if (nodeType === 'storyBeat') {
        updateData.title = title.trim();
        updateData.summary = description.trim();
        updateData.location = location.trim();
        updateData.characterNames = selectedCharacterIds
          .map((id) => {
            const char = nodes.find((n) => n.id === id && n.type === 'character');
            return char ? (char.data as any).name : null;
          })
          .filter(Boolean);
      } else if (nodeType === 'character') {
        updateData.name = title.trim();
        updateData.description = description.trim();
      } else if (nodeType === 'worldRule') {
        updateData.title = title.trim();
        updateData.description = description.trim();
      } else if (nodeType === 'location') {
        updateData.name = title.trim();
        updateData.description = description.trim();
      } else if (nodeType === 'object') {
        updateData.name = title.trim();
        updateData.significance = description.trim();
      } else if (nodeType === 'event') {
        updateData.description = title.trim();
        updateData.consequences = description.trim();
      } else if (nodeType === 'conflict') {
        updateData.stakes = title.trim();
        updateData.resolutionStatus = description.trim();
      } else if (nodeType === 'goal') {
        updateData.status = title.trim();
        updateData.obstacles = description.trim();
      } else if (nodeType === 'secret') {
        updateData.content = title.trim();
        updateData.revealStatus = description.trim();
      } else if (nodeType === 'thread') {
        updateData.description = title.trim();
        updateData.resolutionStatus = description.trim();
      }

      useCanvasStore.getState().updateNodeData(newNode.id, updateData);
    }

    // Reset form and close
    setTitle('');
    setDescription('');
    setLocation('');
    setSelectedCharacterIds([]);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setSelectedCharacterIds([]);
    onClose();
  };

  const characterNodes = nodes.filter((n) => n.type === 'character');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-(--surface) border-(--line) text-(--sea-ink)">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-(--sea-ink)">
            <div className={`w-8 h-8 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/40 flex items-center justify-center`}>
              <Icon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
            </div>
            Add {config.label}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="title" className="block text-base font-medium text-(--sea-ink) mb-1.5">
              {config.titleLabel} *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={config.titlePlaceholder}
              className="w-full"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-base font-medium text-(--sea-ink) mb-1.5">
              {config.descLabel}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={config.descPlaceholder}
              className="w-full px-3 py-2 text-base rounded-lg border border-(--line) bg-transparent text-(--sea-ink) placeholder:text-(--sea-ink-soft) focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {nodeType === 'storyBeat' && (
            <>
              <div>
                <label htmlFor="location" className="block text-base font-medium text-(--sea-ink) mb-1.5">
                  Location (optional)
                </label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where does this take place..."
                  className="w-full"
                />
              </div>

              {characterNodes.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-base font-medium text-(--sea-ink)">
                    Characters in this beat (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {characterNodes.map((char) => {
                      const isSelected = selectedCharacterIds.includes(char.id);
                      const charData = char.data as any;
                      return (
                        <button
                          key={char.id}
                          type="button"
                          onClick={() => {
                            setSelectedCharacterIds((prev) =>
                              isSelected ? prev.filter((id) => id !== char.id) : [...prev, char.id]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isSelected
                            ? 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300 border-2 border-fuchsia-500'
                            : 'bg-(--line) text-(--sea-ink-soft) border-2 border-transparent hover:border-(--sea-ink-soft)'
                            }`}
                        >
                          {charData.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 rounded-xl bg-linear-to-r from-${config.color}-600 to-${config.color === 'violet' ? 'violet' : config.color}-500 hover:from-${config.color}-700 hover:to-${config.color === 'violet' ? 'violet' : config.color}-600 text-white border-none shadow-lg`}
              disabled={!title.trim()}
            >
              <Plus className="w-4 h-4" />
              Add {config.label}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
