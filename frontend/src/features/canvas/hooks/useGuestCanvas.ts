import { useEffect, useCallback } from 'react';
import { useCanvasStore } from '#/features/canvas/store/useCanvasStore';
import type { StoryNode, StoryEdge } from '#/features/canvas/types/canvas.types';

const GUEST_CANVAS_KEY = 'plotweaver_guest_canvas';
const GUEST_EXPIRY_KEY = 'plotweaver_guest_expiry';
const GUEST_AI_COUNT_KEY = 'plotweaver_guest_ai_count';
const EXPIRY_DAYS = 7;
const MAX_AI_ANALYSES = 3;

interface GuestCanvasData {
  nodes: StoryNode[];
  edges: StoryEdge[];
  lastSaved: string;
}

/**
 * Hook for managing guest canvas data in localStorage.
 * Handles auto-save, expiration, and AI analysis limits.
 */
export function useGuestCanvas() {
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  const setNodes = useCanvasStore(state => state.setNodes);
  const setEdges = useCanvasStore(state => state.setEdges);
  const setHasUnsavedChanges = useCanvasStore(state => state.setHasUnsavedChanges);

  /**
   * Check if guest canvas has expired (7 days)
   */
  const isExpired = useCallback((): boolean => {
    const expiryStr = localStorage.getItem(GUEST_EXPIRY_KEY);
    if (!expiryStr) return false;
    
    const expiryDate = new Date(expiryStr);
    return new Date() > expiryDate;
  }, []);

  /**
   * Initialize expiry date for new guest canvas
   */
  const initializeExpiry = useCallback(() => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
    localStorage.setItem(GUEST_EXPIRY_KEY, expiryDate.toISOString());
  }, []);

  /**
   * Load guest canvas from localStorage
   */
  const loadGuestCanvas = useCallback(() => {
    try {
      // Check if expired
      if (isExpired()) {
        clearGuestCanvas();
        return;
      }

      const dataStr = localStorage.getItem(GUEST_CANVAS_KEY);
      if (!dataStr) {
        // Initialize new guest canvas
        initializeExpiry();
        return;
      }

      const data: GuestCanvasData = JSON.parse(dataStr);
      setNodes(data.nodes);
      setEdges(data.edges);
      setHasUnsavedChanges(false);
      
      console.log('Guest canvas loaded from localStorage');
    } catch (error) {
      console.error('Failed to load guest canvas:', error);
      clearGuestCanvas();
    }
  }, [isExpired, initializeExpiry, setNodes, setEdges, setHasUnsavedChanges]);

  /**
   * Save guest canvas to localStorage
   */
  const saveGuestCanvas = useCallback(() => {
    try {
      const data: GuestCanvasData = {
        nodes,
        edges,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(GUEST_CANVAS_KEY, JSON.stringify(data));
      setHasUnsavedChanges(false);
      console.log('Guest canvas saved to localStorage');
    } catch (error) {
      console.error('Failed to save guest canvas:', error);
    }
  }, [nodes, edges, setHasUnsavedChanges]);

  /**
   * Clear guest canvas from localStorage
   */
  const clearGuestCanvas = useCallback(() => {
    localStorage.removeItem(GUEST_CANVAS_KEY);
    localStorage.removeItem(GUEST_EXPIRY_KEY);
    localStorage.removeItem(GUEST_AI_COUNT_KEY);
    setNodes([]);
    setEdges([]);
    setHasUnsavedChanges(false);
    console.log('Guest canvas cleared');
  }, [setNodes, setEdges, setHasUnsavedChanges]);

  /**
   * Get remaining AI analysis count
   */
  const getRemainingAICount = useCallback((): number => {
    const countStr = localStorage.getItem(GUEST_AI_COUNT_KEY);
    const used = countStr ? parseInt(countStr, 10) : 0;
    return Math.max(0, MAX_AI_ANALYSES - used);
  }, []);

  /**
   * Increment AI analysis count
   */
  const incrementAICount = useCallback(() => {
    const countStr = localStorage.getItem(GUEST_AI_COUNT_KEY);
    const used = countStr ? parseInt(countStr, 10) : 0;
    localStorage.setItem(GUEST_AI_COUNT_KEY, (used + 1).toString());
  }, []);

  /**
   * Check if AI analysis is available
   */
  const canUseAI = useCallback((): boolean => {
    return getRemainingAICount() > 0;
  }, [getRemainingAICount]);

  /**
   * Get guest canvas data for migration to authenticated user
   */
  const getGuestCanvasData = useCallback((): GuestCanvasData | null => {
    try {
      const dataStr = localStorage.getItem(GUEST_CANVAS_KEY);
      if (!dataStr) return null;
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Failed to get guest canvas data:', error);
      return null;
    }
  }, []);

  /**
   * Check if guest canvas has data
   */
  const hasGuestCanvas = useCallback((): boolean => {
    const dataStr = localStorage.getItem(GUEST_CANVAS_KEY);
    if (!dataStr) return false;
    
    try {
      const data: GuestCanvasData = JSON.parse(dataStr);
      return data.nodes.length > 0 || data.edges.length > 0;
    } catch {
      return false;
    }
  }, []);

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (nodes.length > 0 || edges.length > 0) {
        saveGuestCanvas();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [nodes, edges, saveGuestCanvas]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (nodes.length > 0 || edges.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [nodes, edges]);

  return {
    loadGuestCanvas,
    saveGuestCanvas,
    clearGuestCanvas,
    getGuestCanvasData,
    hasGuestCanvas,
    canUseAI,
    getRemainingAICount,
    incrementAICount,
    isExpired,
  };
}
