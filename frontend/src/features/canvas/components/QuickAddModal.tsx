import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '#/features/shadcn/components/ui/dialog';
import { Button } from '#/features/shadcn/components/ui/button';
import { Textarea } from '#/features/shadcn/components/ui/textarea';
import { Checkbox } from '#/features/shadcn/components/ui/checkbox';
import { Loader2, Wand2, CheckCircle2, FileUp, FileText, File, X } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addNode = useCanvasStore(state => state.addNode);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setError('Only PDF files are supported.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5MB limit.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleExtract = async () => {
    if (activeTab === 'text' && !text.trim()) return;
    if (activeTab === 'file' && !file) return;

    setIsExtracting(true);
    setError(null);
    setEntities([]);

    try {
      let res: Response;

      if (activeTab === 'text') {
        res = await fetch(`${BACKEND_URL}/api/ingest/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
      } else {
        const formData = new FormData();
        formData.append('file', file!);
        res = await fetch(`${BACKEND_URL}/api/ingest/file`, {
          method: 'POST',
          body: formData,
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Extraction failed');
      }
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
      (data.world_rules || []).forEach((r: any) => {
        newEntities.push({
          id: r.id, type: 'worldRule', label: `Rule: ${r.title || 'World Rule'}`,
          details: r.description, data: r, selected: true
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
    setFile(null);
    setEntities([]);
    onOpenChange(false);
  };

  const isExtractDisabled = isExtracting || (activeTab === 'text' ? !text.trim() : !file);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 island-shell border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-(--sea-ink)">
            <Wand2 className="w-5 h-5 text-violet-500" />
            Quick Add
          </DialogTitle>
          <DialogDescription className="text-(--sea-ink-soft)">
            Paste text or upload a PDF manuscript. AI will extract characters, locations, events, and rules into canvas nodes.
          </DialogDescription>
        </DialogHeader>

        {entities.length === 0 ? (
          <div className="space-y-4 py-2">
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-(--line)">
              <button
                type="button"
                onClick={() => { setActiveTab('text'); setError(null); }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'text'
                    ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-(--sea-ink-soft) hover:text-(--sea-ink)'
                }`}
              >
                <FileText className="w-4 h-4" />
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('file'); setError(null); }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'file'
                    ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-(--sea-ink-soft) hover:text-(--sea-ink)'
                }`}
              >
                <FileUp className="w-4 h-4" />
                Upload PDF
              </button>
            </div>

            {activeTab === 'text' ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="The storm raged outside the Crimson Keep. Elena gripped her sword tightly..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={6000}
                  className="min-h-[180px] bg-(--surface) border-(--line) resize-none"
                />
                <div className="flex justify-between items-center text-xs text-(--sea-ink-soft)">
                  <span>{error ? <span className="text-rose-500">{error}</span> : "Paste up to ~1000 words."}</span>
                  <span>{text.length} / 6000 characters</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-(--line) hover:border-violet-400 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-(--surface)/50 hover:bg-(--surface) transition-all"
                  >
                    <div className="p-3 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-500">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-(--sea-ink)">Click to select a PDF file</p>
                      <p className="text-xs text-(--sea-ink-soft) mt-1">Accepts .pdf files only</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-(--surface) border border-(--line)">
                    <div className="flex items-center gap-3 min-w-0">
                      <File className="w-8 h-8 text-violet-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-(--sea-ink) truncate">{file.name}</p>
                        <p className="text-xs text-(--sea-ink-soft)">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="text-xs text-(--sea-ink-soft) space-y-1">
                  <p>📄 <strong className="text-(--sea-ink)">Recommended length:</strong> 3 to 5 pages (up to 5MB).</p>
                  {error && <p className="text-rose-500 font-medium">{error}</p>}
                </div>
              </div>
            )}
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
              disabled={isExtractDisabled}
              className="w-full bg-linear-to-r from-violet-600 to-fuchsia-500 text-white"
            >
              {isExtracting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting with Docling...</>
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
