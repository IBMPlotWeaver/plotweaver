import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '#/features/shadcn/components/ui/dialog';
import { Button } from '#/features/shadcn/components/ui/button';
import { Textarea } from '#/features/shadcn/components/ui/textarea';
import { Checkbox } from '#/features/shadcn/components/ui/checkbox';
import { Loader2, Wand2, CheckCircle2 } from 'lucide-react';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExtractedEntity {
  id: string;
  type: string;
  label: string;
  details: string;
  data: any;
  selected: boolean;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addNode = useCanvasStore(state => state.addNode);

  const handleExtract = async () => {
    if (!text.trim()) return;
    setIsExtracting(true);
    setError(null);
    setEntities([]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ingest/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('Extraction failed');
      const data = await res.json();

      const newEntities: ExtractedEntity[] = [];

      (data.characters || []).forEach((c: any) => {
        newEntities.push({
          id: c.id, type: 'character', label: `Character: ${c.name}`,
          details: c.description, data: c, selected: true
        });
      });
      (data.locations || []).forEach((l: any) => {
        newEntities.push({
          id: l.id, type: 'location', label: `Location: ${l.name}`,
          details: l.description, data: l, selected: true
        });
      });
      (data.events || []).forEach((e: any) => {
        newEntities.push({
          id: e.id, type: 'event', label: 'Event',
          details: e.description, data: e, selected: true
        });
      });
      (data.objects || []).forEach((o: any) => {
        newEntities.push({
          id: o.id, type: 'object', label: `Object: ${o.name}`,
          details: o.properties || '', data: o, selected: true
        });
      });

      setEntities(newEntities);
    } catch (err: any) {
      setError(err.message || 'Failed to extract entities');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCommit = () => {
    const selected = entities.filter(e => e.selected);
    let index = 0;
    selected.forEach((ent) => {
      // Position nodes in a 3-column grid starting near the center
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 350 + col * 260;
      const y = 150 + row * 180;
      
      addNode(ent.type as any, { x, y }, ent.data);
      index += 1;
    });

    setText('');
    setEntities([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 island-shell border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-(--sea-ink)">
            <Wand2 className="w-5 h-5 text-violet-500" />
            Quick Add
          </DialogTitle>
          <DialogDescription className="text-(--sea-ink-soft)">
            Paste a scene, manuscript excerpt, or lore text. AI will extract characters, locations, and events for you to add to the canvas.
          </DialogDescription>
        </DialogHeader>

        {entities.length === 0 ? (
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="The wind howled through the Lighthouse. Elena gripped her sword tightly..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={6000}
              className="min-h-[200px] bg-(--surface) border-(--line) resize-none"
            />
            <div className="flex justify-between items-center text-xs text-(--sea-ink-soft)">
              <span>{error ? <span className="text-rose-500">{error}</span> : "Paste up to ~1000 words."}</span>
              <span>{text.length} / 6000 characters</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4 max-h-100 overflow-y-auto custom-scrollbar pr-2">
            <p className="text-sm font-medium text-(--sea-ink)">Select entities to add to your graph:</p>
            {entities.map(ent => (
              <div key={ent.id} className="flex items-start gap-3 p-3 rounded-lg bg-(--surface) border border-(--line)">
                <Checkbox
                  checked={ent.selected}
                  onCheckedChange={(checked) => {
                    setEntities(entities.map(e => e.id === ent.id ? { ...e, selected: checked === true } : e));
                  }}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-sm text-(--sea-ink)">{ent.label}</p>
                  <p className="text-xs text-(--sea-ink-soft) mt-1">{ent.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {entities.length === 0 ? (
            <Button
              onClick={handleExtract}
              disabled={isExtracting || !text.trim()}
              className="w-full bg-linear-to-r from-violet-600 to-fuchsia-500 text-white"
            >
              {isExtracting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Extract Entities</>
              )}
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setEntities([])}>
                Cancel
              </Button>
              <Button onClick={handleCommit} className="flex-1 bg-violet-600 text-white hover:bg-violet-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Add to Canvas
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
