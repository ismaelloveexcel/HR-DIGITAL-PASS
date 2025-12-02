/**
 * usePassData - React hook for pass data management
 * Provides reactive access to the pass data store with auto-save
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getStore,
  subscribe,
  getCandidate,
  getAllCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  addTimelineEntry,
  updateTimelineEntry,
  deleteTimelineEntry,
  exportToJSON,
  importFromJSON,
  downloadAsJSON,
  uploadFromFile,
  resetToDefaults,
  getPassSettings,
  updatePassSettings,
  toggleModule,
  toggleAutomation,
  getLinksForCode,
  updateLinkSlot,
  getUniversalRecord,
  updateUniversalRecord,
  type PassDataStore,
  type PassSettings,
  type PassLink,
  type PassLinkSlot,
  type PassModules,
  type PassAutomations,
  type UniversalPassRecord,
} from '@/lib/passDataStore';
import type { CandidateWithRelations, TimelineEntry } from '@shared/schema';

export function usePassData() {
  const [store, setStore] = useState<PassDataStore>(getStore);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe((newStore) => {
      setStore({ ...newStore });
      setLastSaved(new Date());
    });
    return unsubscribe;
  }, []);

  const getCandidateByCode = useCallback((code: string): CandidateWithRelations | undefined => {
    return getCandidate(code);
  }, []);

  const listCandidates = useCallback((): CandidateWithRelations[] => {
    return getAllCandidates();
  }, []);

  const addCandidate = useCallback((
    candidate: Partial<CandidateWithRelations> & { code: string; name: string; title: string; email: string }
  ): CandidateWithRelations => {
    return createCandidate(candidate);
  }, []);

  const editCandidate = useCallback((
    code: string,
    updates: Partial<CandidateWithRelations>
  ): CandidateWithRelations | undefined => {
    return updateCandidate(code, updates);
  }, []);

  const removeCandidate = useCallback((code: string): boolean => {
    return deleteCandidate(code);
  }, []);

  const addTimeline = useCallback((
    code: string,
    entry: Omit<TimelineEntry, 'id' | 'candidateId' | 'createdAt'>
  ): TimelineEntry | undefined => {
    return addTimelineEntry(code, entry);
  }, []);

  const editTimeline = useCallback((
    code: string,
    entryId: number,
    updates: Partial<TimelineEntry>
  ): TimelineEntry | undefined => {
    return updateTimelineEntry(code, entryId, updates);
  }, []);

  const removeTimeline = useCallback((code: string, entryId: number): boolean => {
    return deleteTimelineEntry(code, entryId);
  }, []);

  const getBlueprint = useCallback((code: string): UniversalPassRecord => {
    return getUniversalRecord(code);
  }, []);

  const editBlueprint = useCallback((
    code: string,
    updates: Partial<UniversalPassRecord>,
  ): UniversalPassRecord => {
    return updateUniversalRecord(code, updates);
  }, []);

  const getSettings = useCallback((code: string): PassSettings => {
    return getPassSettings(code);
  }, []);

  const editSettings = useCallback((code: string, updates: Partial<PassSettings>): PassSettings => {
    return updatePassSettings(code, updates);
  }, []);

  const toggleModuleVisibility = useCallback((
    code: string,
    module: keyof PassModules,
    value?: boolean,
  ): PassSettings => {
    return toggleModule(code, module, value);
  }, []);

  const toggleAutomationPref = useCallback((
    code: string,
    automation: keyof PassAutomations,
    value?: boolean,
  ): PassSettings => {
    return toggleAutomation(code, automation, value);
  }, []);

  const listLinksForCode = useCallback((code: string): PassLink[] => {
    return getLinksForCode(code);
  }, []);

  const mutateLinkSlot = useCallback((
    linkId: string,
    slotId: string,
    updates: Partial<PassLinkSlot>,
  ): PassLink | undefined => {
    return updateLinkSlot(linkId, slotId, updates);
  }, []);

  const exportData = useCallback((): string => {
    return exportToJSON();
  }, []);

  const importData = useCallback((jsonString: string): boolean => {
    return importFromJSON(jsonString);
  }, []);

  const downloadData = useCallback((filename?: string) => {
    downloadAsJSON(filename);
  }, []);

  const uploadData = useCallback((): Promise<boolean> => {
    return uploadFromFile();
  }, []);

  const reset = useCallback(() => {
    resetToDefaults();
  }, []);

  return {
    // Store state
    store,
    lastSaved,
    candidates: store.candidates,
    
    // Candidate CRUD
    getCandidateByCode,
    listCandidates,
    addCandidate,
    editCandidate,
    removeCandidate,
    
    // Timeline operations
    addTimeline,
    editTimeline,
    removeTimeline,
    getUniversalRecord: getBlueprint,
    updateUniversalRecord: editBlueprint,
    
    // Export/Import
    exportData,
    importData,
    downloadData,
    uploadData,
    
    // Reset
    reset,

    // Settings & Links
    getPassSettings: getSettings,
    updatePassSettings: editSettings,
    toggleModuleVisibility,
    toggleAutomationPref,
    getLinksForCode: listLinksForCode,
    updateLinkSlot: mutateLinkSlot,
  };
}
