/**
 * Pass Data Store - Centralized data management with localStorage persistence
 * Supports CRUD operations, auto-save, and JSON export/import for SOLO HR workflows
 */

import type { CandidateWithRelations, TimelineEntry, Evaluation, Document } from '@shared/schema';
import { MOCK_USERS, type UserData } from './mockData';

const STORAGE_KEY = 'hr-digital-pass-data';
const STORAGE_VERSION = '1.0';

export interface PassDataStore {
  version: string;
  candidates: Record<string, CandidateWithRelations>;
  lastUpdated: string;
}

// Initialize store from localStorage or mock data
function initializeStore(): PassDataStore {
  if (typeof window === 'undefined') {
    return createDefaultStore();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PassDataStore;
      if (parsed.version === STORAGE_VERSION) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load pass data from localStorage:', e);
  }
  
  return createDefaultStore();
}

function createDefaultStore(): PassDataStore {
  const candidates: Record<string, CandidateWithRelations> = {};
  
  // Convert mock users to CandidateWithRelations
  Object.entries(MOCK_USERS).forEach(([code, user]) => {
    candidates[code] = mockUserToCandidate(user);
  });
  
  return {
    version: STORAGE_VERSION,
    candidates,
    lastUpdated: new Date().toISOString(),
  };
}

function mockUserToCandidate(user: UserData): CandidateWithRelations {
  const now = new Date();
  
  const timeline: TimelineEntry[] = (user.timeline ?? []).map((item, index) => ({
    id: -(index + 1),
    candidateId: -1,
    title: item.title,
    date: item.date,
    status: item.status,
    order: index + 1,
    createdAt: now,
  }));

  const evaluations: Evaluation[] = (user.stats ?? []).map((stat, index) => ({
    id: -(index + 1),
    candidateId: -1,
    type: stat.label,
    score: stat.value,
    notes: '',
    evaluator: stat.icon ?? 'Auto',
    date: '—',
    createdAt: now,
  }));

  const documents: Document[] = [
    {
      id: -1,
      candidateId: -1,
      title: 'Universal Brief',
      type: 'Summary',
      url: '#',
      uploadedAt: now,
    },
    {
      id: -2,
      candidateId: -1,
      title: 'Latest Update',
      type: 'Note',
      url: '#',
      uploadedAt: now,
    },
  ];

  return {
    id: -1,
    code: user.code,
    name: user.name,
    title: user.title,
    email: user.email ?? `${user.name.split(' ')[0].toLowerCase()}@example.com`,
    phone: user.phone ?? null,
    department: user.department ?? null,
    location: user.location ?? null,
    status: user.status,
    createdAt: now,
    timeline,
    evaluations,
    documents,
  };
}

// In-memory store instance
let store = initializeStore();

// Listeners for store changes
const listeners = new Set<(store: PassDataStore) => void>();

function notifyListeners() {
  listeners.forEach(listener => listener(store));
}

function saveToLocalStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    store.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('Failed to save pass data to localStorage:', e);
  }
}

// === CRUD Operations ===

export function getCandidate(code: string): CandidateWithRelations | undefined {
  return store.candidates[code.toUpperCase()];
}

export function getAllCandidates(): CandidateWithRelations[] {
  return Object.values(store.candidates);
}

export function createCandidate(candidate: Partial<CandidateWithRelations> & { code: string; name: string; title: string; email: string }): CandidateWithRelations {
  const code = candidate.code.toUpperCase();
  const now = new Date();
  
  const newCandidate: CandidateWithRelations = {
    id: Date.now(),
    code,
    name: candidate.name,
    title: candidate.title,
    email: candidate.email,
    phone: candidate.phone ?? null,
    department: candidate.department ?? null,
    location: candidate.location ?? null,
    status: candidate.status ?? 'Active',
    createdAt: now,
    timeline: candidate.timeline ?? [],
    evaluations: candidate.evaluations ?? [],
    documents: candidate.documents ?? [],
  };
  
  store.candidates[code] = newCandidate;
  saveToLocalStorage();
  notifyListeners();
  
  return newCandidate;
}

export function updateCandidate(code: string, updates: Partial<CandidateWithRelations>): CandidateWithRelations | undefined {
  const upperCode = code.toUpperCase();
  const existing = store.candidates[upperCode];
  
  if (!existing) return undefined;
  
  const updated: CandidateWithRelations = {
    ...existing,
    ...updates,
    code: upperCode, // Preserve code
    id: existing.id, // Preserve id
    createdAt: existing.createdAt, // Preserve createdAt
  };
  
  store.candidates[upperCode] = updated;
  saveToLocalStorage();
  notifyListeners();
  
  return updated;
}

export function deleteCandidate(code: string): boolean {
  const upperCode = code.toUpperCase();
  
  if (!store.candidates[upperCode]) return false;
  
  delete store.candidates[upperCode];
  saveToLocalStorage();
  notifyListeners();
  
  return true;
}

// === Timeline Operations ===

export function addTimelineEntry(code: string, entry: Omit<TimelineEntry, 'id' | 'candidateId' | 'createdAt'>): TimelineEntry | undefined {
  const candidate = store.candidates[code.toUpperCase()];
  if (!candidate) return undefined;
  
  const newEntry: TimelineEntry = {
    ...entry,
    id: Date.now(),
    candidateId: candidate.id,
    createdAt: new Date(),
  };
  
  candidate.timeline = [...candidate.timeline, newEntry];
  saveToLocalStorage();
  notifyListeners();
  
  return newEntry;
}

export function updateTimelineEntry(code: string, entryId: number, updates: Partial<TimelineEntry>): TimelineEntry | undefined {
  const candidate = store.candidates[code.toUpperCase()];
  if (!candidate) return undefined;
  
  const entryIndex = candidate.timeline.findIndex(e => e.id === entryId);
  if (entryIndex === -1) return undefined;
  
  const updatedEntry = { ...candidate.timeline[entryIndex], ...updates };
  candidate.timeline[entryIndex] = updatedEntry;
  
  saveToLocalStorage();
  notifyListeners();
  
  return updatedEntry;
}

export function deleteTimelineEntry(code: string, entryId: number): boolean {
  const candidate = store.candidates[code.toUpperCase()];
  if (!candidate) return false;
  
  const initialLength = candidate.timeline.length;
  candidate.timeline = candidate.timeline.filter(e => e.id !== entryId);
  
  if (candidate.timeline.length === initialLength) return false;
  
  saveToLocalStorage();
  notifyListeners();
  
  return true;
}

// === Export/Import ===

export function exportToJSON(): string {
  return JSON.stringify(store, null, 2);
}

export function importFromJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString) as PassDataStore;
    
    // Validate structure
    if (!parsed.candidates || typeof parsed.candidates !== 'object') {
      throw new Error('Invalid data structure');
    }
    
    // Update store
    store = {
      version: STORAGE_VERSION,
      candidates: parsed.candidates,
      lastUpdated: new Date().toISOString(),
    };
    
    saveToLocalStorage();
    notifyListeners();
    
    return true;
  } catch (e) {
    console.error('Failed to import pass data:', e);
    return false;
  }
}

export function downloadAsJSON(filename = 'hr-pass-data.json') {
  const json = exportToJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function uploadFromFile(): Promise<boolean> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(false);
        return;
      }
      
      try {
        const text = await file.text();
        const result = importFromJSON(text);
        resolve(result);
      } catch {
        resolve(false);
      }
    };
    
    input.click();
  });
}

// === Store Subscription ===

export function subscribe(listener: (store: PassDataStore) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStore(): PassDataStore {
  return store;
}

// === Reset ===

export function resetToDefaults() {
  store = createDefaultStore();
  saveToLocalStorage();
  notifyListeners();
}
