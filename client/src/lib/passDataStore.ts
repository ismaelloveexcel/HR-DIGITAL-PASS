/**
 * Pass Data Store - Centralized data management with localStorage persistence
 * Supports CRUD operations, auto-save, and JSON export/import for SOLO HR workflows
 */

import type { CandidateWithRelations, TimelineEntry, Evaluation, Document } from '@shared/schema';
import { MOCK_USERS, type UserData } from './mockData';

export type PassTheme = 'light' | 'dark' | 'tech';

export interface PassModules {
  timeline: boolean;
  documents: boolean;
  availability: boolean;
  interactions: boolean;
}

export interface PassAutomations {
  reminders: boolean;
  docs: boolean;
  digest: boolean;
}

export interface PassSettings {
  modules: PassModules;
  automations: PassAutomations;
  theme: PassTheme;
}

export type SlotStatus = 'open' | 'held' | 'booked';

export interface PassLinkSlot {
  id: string;
  label: string;
  date: string;
  time: string;
  status: SlotStatus;
  managerCode: string;
  candidateCode?: string;
  notes?: string;
}

export interface PassLink {
  id: string;
  title: string;
  managerCode: string;
  candidateCode: string;
  field: string;
  slots: PassLinkSlot[];
  lastUpdated: string;
}

const STORAGE_KEY = 'hr-digital-pass-data';
const STORAGE_VERSION = '1.0';

const DEFAULT_MODULES: PassModules = {
  timeline: true,
  documents: true,
  availability: true,
  interactions: true,
};

const DEFAULT_AUTOMATIONS: PassAutomations = {
  reminders: true,
  docs: true,
  digest: false,
};

export interface PassDataStore {
  version: string;
  candidates: Record<string, CandidateWithRelations>;
  settings: Record<string, PassSettings>;
  links: PassLink[];
  lastUpdated: string;
}

function deriveThemeFromCode(code: string): PassTheme {
  const upper = code.toUpperCase();
  if (upper.startsWith('REQ')) return 'tech';
  if (upper.startsWith('ONB')) return 'dark';
  return 'light';
}

function buildDefaultSettings(code: string): PassSettings {
  return {
    modules: { ...DEFAULT_MODULES },
    automations: { ...DEFAULT_AUTOMATIONS },
    theme: deriveThemeFromCode(code),
  };
}

function createDefaultLinks(candidates: Record<string, CandidateWithRelations>): PassLink[] {
  const links: PassLink[] = [];
  const candidateExists = Boolean(candidates['PASS-001']);
  const managerExists = Boolean(candidates['REQ-001']);
  const onboardingExists = Boolean(candidates['ONB-001']);
  const nowIso = new Date().toISOString();

  if (candidateExists && managerExists) {
    links.push({
      id: 'link-final-interview',
      title: 'Final Interview Availability',
      managerCode: 'REQ-001',
      candidateCode: 'PASS-001',
      field: 'interviewAvailability',
      slots: [
        { id: 'slot-a', label: 'Morning', date: 'Dec 05', time: '09:30', status: 'open', managerCode: 'REQ-001' },
        { id: 'slot-b', label: 'Midday', date: 'Dec 05', time: '12:00', status: 'held', managerCode: 'REQ-001' },
        { id: 'slot-c', label: 'Late', date: 'Dec 05', time: '16:00', status: 'open', managerCode: 'REQ-001' },
      ],
      lastUpdated: nowIso,
    });
  }

  if (candidateExists && onboardingExists) {
    links.push({
      id: 'link-onboarding-kit',
      title: 'Onboarding Kit Tasks',
      managerCode: 'ONB-001',
      candidateCode: 'PASS-001',
      field: 'onboardingChecklist',
      slots: [
        { id: 'kit-id', label: 'ID Badge', date: 'Dec 01', time: 'All Day', status: 'held', managerCode: 'ONB-001' },
        { id: 'kit-laptop', label: 'Device Pickup', date: 'Nov 30', time: '10:00', status: 'open', managerCode: 'ONB-001' },
      ],
      lastUpdated: nowIso,
    });
  }

  return links;
}

function upgradeStore(parsed?: Partial<PassDataStore>): PassDataStore {
  const candidates = parsed?.candidates ?? {};
  const settings: Record<string, PassSettings> = { ...(parsed?.settings ?? {}) };

  Object.keys(candidates).forEach((code) => {
    const upper = code.toUpperCase();
    if (!settings[upper]) {
      settings[upper] = buildDefaultSettings(upper);
    }
  });

  const links = parsed?.links && parsed.links.length > 0
    ? parsed.links
    : createDefaultLinks(candidates);

  return {
    version: STORAGE_VERSION,
    candidates,
    settings,
    links,
    lastUpdated: parsed?.lastUpdated ?? new Date().toISOString(),
  };
}

function ensureSettingsEntry(code: string): PassSettings {
  const upper = code.toUpperCase();
  if (!store.settings[upper]) {
    store.settings[upper] = buildDefaultSettings(upper);
  }
  return store.settings[upper];
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
        return upgradeStore(parsed);
      }
      return upgradeStore(parsed);
    }
  } catch (e) {
    console.warn('Failed to load pass data from localStorage:', e);
  }
  
  return createDefaultStore();
}

function createDefaultStore(): PassDataStore {
  const candidates: Record<string, CandidateWithRelations> = {};
  const settings: Record<string, PassSettings> = {};
  
  // Convert mock users to CandidateWithRelations
  Object.entries(MOCK_USERS).forEach(([code, user]) => {
    const upper = code.toUpperCase();
    candidates[upper] = mockUserToCandidate(user);
    settings[upper] = buildDefaultSettings(upper);
  });
  
  return {
    version: STORAGE_VERSION,
    candidates,
    settings,
    links: createDefaultLinks(candidates),
    lastUpdated: new Date().toISOString(),
  };
}

function mockUserToCandidate(user: UserData): CandidateWithRelations {
  const now = new Date();
  const baseId = Date.now();
  
  const timeline: TimelineEntry[] = (user.timeline ?? []).map((item, index) => ({
    id: baseId + index + 1,
    candidateId: baseId,
    title: item.title,
    date: item.date,
    status: item.status,
    order: index + 1,
    createdAt: now,
  }));

  const evaluations: Evaluation[] = (user.stats ?? []).map((stat, index) => ({
    id: baseId + 100 + index,
    candidateId: baseId,
    type: stat.label,
    score: stat.value,
    notes: '',
    evaluator: stat.icon ?? 'Auto',
    date: '—',
    createdAt: now,
  }));

  const documents: Document[] = [
    {
      id: baseId + 200,
      candidateId: baseId,
      title: 'Universal Brief',
      type: 'Summary',
      url: '#',
      uploadedAt: now,
    },
    {
      id: baseId + 201,
      candidateId: baseId,
      title: 'Latest Update',
      type: 'Note',
      url: '#',
      uploadedAt: now,
    },
  ];

  return {
    id: baseId,
    code: user.code.toUpperCase(),
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
  store.settings[code] = store.settings[code] ?? buildDefaultSettings(code);
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
  delete store.settings[upperCode];
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

// === Settings & Link Operations ===

export function getPassSettings(code: string): PassSettings {
  return ensureSettingsEntry(code);
}

export function updatePassSettings(code: string, updates: Partial<PassSettings>): PassSettings {
  const upper = code.toUpperCase();
  const current = ensureSettingsEntry(upper);
  const merged: PassSettings = {
    ...current,
    ...updates,
    modules: {
      ...current.modules,
      ...(updates.modules ?? {}),
    },
    automations: {
      ...current.automations,
      ...(updates.automations ?? {}),
    },
    theme: updates.theme ?? current.theme,
  };

  store.settings[upper] = merged;
  saveToLocalStorage();
  notifyListeners();

  return merged;
}

export function toggleModule(
  code: string,
  module: keyof PassModules,
  value?: boolean,
): PassSettings {
  const upper = code.toUpperCase();
  const current = ensureSettingsEntry(upper);
  const nextValue = typeof value === 'boolean' ? value : !current.modules[module];
  return updatePassSettings(upper, {
    modules: {
      ...current.modules,
      [module]: nextValue,
    },
  });
}

export function toggleAutomation(
  code: string,
  automation: keyof PassAutomations,
  value?: boolean,
): PassSettings {
  const upper = code.toUpperCase();
  const current = ensureSettingsEntry(upper);
  const nextValue = typeof value === 'boolean' ? value : !current.automations[automation];
  return updatePassSettings(upper, {
    automations: {
      ...current.automations,
      [automation]: nextValue,
    },
  });
}

export function getLinksForCode(code: string): PassLink[] {
  const upper = code.toUpperCase();
  return store.links.filter(
    (link) => link.candidateCode === upper || link.managerCode === upper,
  );
}

export function updateLinkSlot(
  linkId: string,
  slotId: string,
  updates: Partial<PassLinkSlot>,
): PassLink | undefined {
  const linkIndex = store.links.findIndex((link) => link.id === linkId);
  if (linkIndex === -1) return undefined;

  const link = store.links[linkIndex];
  let updatedSlots = link.slots.map((slot) => {
    if (slot.id !== slotId) return { ...slot };
    const next: PassLinkSlot = { ...slot, ...updates };
    if (updates.status && updates.status !== 'booked' && updates.candidateCode === undefined) {
      next.candidateCode = undefined;
    }
    return next;
  });

  const targetSlot = updatedSlots.find((slot) => slot.id === slotId);
  if (!targetSlot) return undefined;

  if (
    targetSlot.status === 'booked' ||
    updates.status === 'booked' ||
    (updates.candidateCode && (updates.status ?? targetSlot.status) === 'booked')
  ) {
    const candidateCode = updates.candidateCode ?? targetSlot.candidateCode;
    if (candidateCode) {
      updatedSlots = updatedSlots.map((slot) => {
        if (slot.id === targetSlot.id) return slot;
        if (slot.candidateCode === candidateCode) {
          return {
            ...slot,
            candidateCode: undefined,
            status: slot.status === 'booked' ? 'open' : slot.status,
          };
        }
        return slot;
      });
    }
  }

  const updatedLink: PassLink = {
    ...link,
    slots: updatedSlots,
    lastUpdated: new Date().toISOString(),
  };

  store.links = [
    ...store.links.slice(0, linkIndex),
    updatedLink,
    ...store.links.slice(linkIndex + 1),
  ];
  saveToLocalStorage();
  notifyListeners();

  return updatedLink;
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
