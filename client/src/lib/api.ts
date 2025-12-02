import type { 
  Candidate, 
  InsertCandidate, 
  CandidateWithRelations,
  TimelineEntry,
  InsertTimelineEntry,
  Evaluation,
  InsertEvaluation,
  Document,
  InsertDocument 
} from "@shared/schema";

// Candidates
export async function getCandidates(): Promise<Candidate[]> {
  const response = await fetch("/api/candidates");
  if (!response.ok) throw new Error("Failed to fetch candidates");
  return response.json();
}

export async function getCandidate(id: number): Promise<CandidateWithRelations> {
  const response = await fetch(`/api/candidates/${id}`);
  if (!response.ok) throw new Error("Failed to fetch candidate");
  return response.json();
}

export async function getCandidateByCode(code: string): Promise<CandidateWithRelations> {
  const response = await fetch(`/api/candidates/code/${code}`);
  if (!response.ok) throw new Error("Failed to fetch candidate");
  return response.json();
}

export async function createCandidate(candidate: InsertCandidate): Promise<Candidate> {
  const response = await fetch("/api/candidates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidate),
  });
  if (!response.ok) throw new Error("Failed to create candidate");
  return response.json();
}

export async function updateCandidate(id: number, data: Partial<InsertCandidate>): Promise<Candidate> {
  const response = await fetch(`/api/candidates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update candidate");
  return response.json();
}

export async function deleteCandidate(id: number): Promise<void> {
  const response = await fetch(`/api/candidates/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete candidate");
}

// Timeline
export async function getTimelineEntries(candidateId: number): Promise<TimelineEntry[]> {
  const response = await fetch(`/api/candidates/${candidateId}/timeline`);
  if (!response.ok) throw new Error("Failed to fetch timeline");
  return response.json();
}

export async function createTimelineEntry(candidateId: number, entry: Omit<InsertTimelineEntry, 'candidateId'>): Promise<TimelineEntry> {
  const response = await fetch(`/api/candidates/${candidateId}/timeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error("Failed to create timeline entry");
  return response.json();
}

export async function updateTimelineEntry(id: number, data: Partial<InsertTimelineEntry>): Promise<TimelineEntry> {
  const response = await fetch(`/api/timeline/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update timeline entry");
  return response.json();
}

export async function deleteTimelineEntry(id: number): Promise<void> {
  const response = await fetch(`/api/timeline/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete timeline entry");
}

// Evaluations
export async function getEvaluations(candidateId: number): Promise<Evaluation[]> {
  const response = await fetch(`/api/candidates/${candidateId}/evaluations`);
  if (!response.ok) throw new Error("Failed to fetch evaluations");
  return response.json();
}

export async function createEvaluation(candidateId: number, evaluation: Omit<InsertEvaluation, 'candidateId'>): Promise<Evaluation> {
  const response = await fetch(`/api/candidates/${candidateId}/evaluations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(evaluation),
  });
  if (!response.ok) throw new Error("Failed to create evaluation");
  return response.json();
}

export async function updateEvaluation(id: number, data: Partial<InsertEvaluation>): Promise<Evaluation> {
  const response = await fetch(`/api/evaluations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update evaluation");
  return response.json();
}

export async function deleteEvaluation(id: number): Promise<void> {
  const response = await fetch(`/api/evaluations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete evaluation");
}

// Documents
export async function getDocuments(candidateId: number): Promise<Document[]> {
  const response = await fetch(`/api/candidates/${candidateId}/documents`);
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
}

export async function createDocument(candidateId: number, document: Omit<InsertDocument, 'candidateId'>): Promise<Document> {
  const response = await fetch(`/api/candidates/${candidateId}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(document),
  });
  if (!response.ok) throw new Error("Failed to create document");
  return response.json();
}

export async function deleteDocument(id: number): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete document");
}
