import { create } from 'zustand';

export interface ExtractedEntity {
  id: string;
  type: string;
  label: string;
  details: string;
  data: any;
  selected: boolean;
  existsOnCanvas?: boolean;
}

interface QuickAddState {
  activeTab: 'text' | 'file';
  text: string;
  file: File | null;
  isExtracting: boolean;
  entities: ExtractedEntity[];
  error: string | null;

  setActiveTab: (tab: 'text' | 'file') => void;
  setText: (text: string) => void;
  setFile: (file: File | null) => void;
  setError: (error: string | null) => void;
  toggleEntitySelected: (id: string) => void;
  setEntities: (entities: ExtractedEntity[]) => void;
  reset: () => void;
  extractEntities: (canvasNodes: any[]) => Promise<void>;
  commitSelectedEntities: (addNode: (type: any, pos: { x: number; y: number }, data: any) => void) => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

function checkNodeExists(type: string, nameOrTitleOrDesc: string, canvasNodes: any[]): boolean {
  if (!nameOrTitleOrDesc || !nameOrTitleOrDesc.trim()) return false;
  const target = nameOrTitleOrDesc.trim().toLowerCase();

  return canvasNodes.some(n => {
    if (n.type !== type) return false;
    const data = n.data || {};
    let existingValue = '';

    if (type === 'character' || type === 'location' || type === 'object') {
      existingValue = data.name || '';
    } else if (type === 'worldRule') {
      existingValue = data.title || '';
    } else if (type === 'event') {
      existingValue = data.description || '';
    }

    return existingValue.trim().toLowerCase() === target;
  });
}

export const useQuickAddStore = create<QuickAddState>((set, get) => ({
  activeTab: 'text',
  text: '',
  file: null,
  isExtracting: false,
  entities: [],
  error: null,

  setActiveTab: (tab) => set({ activeTab: tab, error: null }),
  setText: (text) => set({ text }),
  setFile: (file) => set({ file, error: null }),
  setError: (error) => set({ error }),
  
  toggleEntitySelected: (id) => set((state) => ({
    entities: state.entities.map(e => e.id === id ? { ...e, selected: !e.selected } : e)
  })),

  setEntities: (entities) => set({ entities }),

  reset: () => set({
    activeTab: 'text',
    text: '',
    file: null,
    isExtracting: false,
    entities: [],
    error: null,
  }),

  extractEntities: async (canvasNodes) => {
    const { activeTab, text, file } = get();
    if (activeTab === 'text' && !text.trim()) return;
    if (activeTab === 'file' && !file) return;

    set({ isExtracting: true, error: null, entities: [] });

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
        const exists = checkNodeExists('character', c.name, canvasNodes);
        newEntities.push({
          id: c.id, type: 'character', label: `Character: ${c.name}`,
          details: c.description, data: c, selected: !exists, existsOnCanvas: exists
        });
      });
      (data.locations || []).forEach((l: any) => {
        const exists = checkNodeExists('location', l.name, canvasNodes);
        newEntities.push({
          id: l.id, type: 'location', label: `Location: ${l.name}`,
          details: l.description, data: l, selected: !exists, existsOnCanvas: exists
        });
      });
      (data.events || []).forEach((e: any) => {
        const exists = checkNodeExists('event', e.description, canvasNodes);
        newEntities.push({
          id: e.id, type: 'event', label: 'Event',
          details: e.description, data: e, selected: !exists, existsOnCanvas: exists
        });
      });
      (data.objects || []).forEach((o: any) => {
        const exists = checkNodeExists('object', o.name, canvasNodes);
        newEntities.push({
          id: o.id, type: 'object', label: `Object: ${o.name}`,
          details: o.properties || '', data: o, selected: !exists, existsOnCanvas: exists
        });
      });
      (data.world_rules || []).forEach((r: any) => {
        const exists = checkNodeExists('worldRule', r.title || r.description, canvasNodes);
        newEntities.push({
          id: r.id, type: 'worldRule', label: `Rule: ${r.title || 'World Rule'}`,
          details: r.description, data: r, selected: !exists, existsOnCanvas: exists
        });
      });

      set({ entities: newEntities });
    } catch (err: any) {
      set({ error: err.message || 'Failed to extract entities' });
    } finally {
      set({ isExtracting: false });
    }
  },

  commitSelectedEntities: (addNode) => {
    const { entities, reset } = get();
    const selected = entities.filter(e => e.selected);
    let index = 0;

    selected.forEach((ent) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 350 + col * 260;
      const y = 150 + row * 180;
      
      addNode(ent.type, { x, y }, ent.data);
      index += 1;
    });

    reset();
  },
}));
