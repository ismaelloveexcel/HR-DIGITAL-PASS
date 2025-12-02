import { 
  candidates, 
  timelineEntries,
  evaluations,
  documents,
  type Candidate,
  type InsertCandidate,
  type TimelineEntry,
  type InsertTimelineEntry,
  type Evaluation,
  type InsertEvaluation,
  type Document,
  type InsertDocument,
  type CandidateWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Candidates
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<CandidateWithRelations | undefined>;
  getCandidateByCode(code: string): Promise<CandidateWithRelations | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;

  // Timeline
  getTimelineEntries(candidateId: number): Promise<TimelineEntry[]>;
  createTimelineEntry(entry: InsertTimelineEntry): Promise<TimelineEntry>;
  updateTimelineEntry(id: number, entry: Partial<InsertTimelineEntry>): Promise<TimelineEntry | undefined>;
  deleteTimelineEntry(id: number): Promise<boolean>;

  // Evaluations
  getEvaluations(candidateId: number): Promise<Evaluation[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  updateEvaluation(id: number, evaluation: Partial<InsertEvaluation>): Promise<Evaluation | undefined>;
  deleteEvaluation(id: number): Promise<boolean>;

  // Documents
  getDocuments(candidateId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates).orderBy(desc(candidates.createdAt));
  }

  async getCandidate(id: number): Promise<CandidateWithRelations | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    if (!candidate) return undefined;

    const timeline = await this.getTimelineEntries(id);
    const evaluationsList = await this.getEvaluations(id);
    const documentsList = await this.getDocuments(id);

    return {
      ...candidate,
      timeline,
      evaluations: evaluationsList,
      documents: documentsList,
    };
  }

  async getCandidateByCode(code: string): Promise<CandidateWithRelations | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.code, code));
    if (!candidate) return undefined;

    const timeline = await this.getTimelineEntries(candidate.id);
    const evaluationsList = await this.getEvaluations(candidate.id);
    const documentsList = await this.getDocuments(candidate.id);

    return {
      ...candidate,
      timeline,
      evaluations: evaluationsList,
      documents: documentsList,
    };
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const [candidate] = await db
      .insert(candidates)
      .values(insertCandidate)
      .returning();
    return candidate;
  }

  async updateCandidate(id: number, updateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [candidate] = await db
      .update(candidates)
      .set(updateData)
      .where(eq(candidates.id, id))
      .returning();
    return candidate || undefined;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    const result = await db.delete(candidates).where(eq(candidates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Timeline
  async getTimelineEntries(candidateId: number): Promise<TimelineEntry[]> {
    return await db
      .select()
      .from(timelineEntries)
      .where(eq(timelineEntries.candidateId, candidateId))
      .orderBy(timelineEntries.order);
  }

  async createTimelineEntry(entry: InsertTimelineEntry): Promise<TimelineEntry> {
    const [timelineEntry] = await db
      .insert(timelineEntries)
      .values(entry)
      .returning();
    return timelineEntry;
  }

  async updateTimelineEntry(id: number, updateData: Partial<InsertTimelineEntry>): Promise<TimelineEntry | undefined> {
    const [entry] = await db
      .update(timelineEntries)
      .set(updateData)
      .where(eq(timelineEntries.id, id))
      .returning();
    return entry || undefined;
  }

  async deleteTimelineEntry(id: number): Promise<boolean> {
    const result = await db.delete(timelineEntries).where(eq(timelineEntries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Evaluations
  async getEvaluations(candidateId: number): Promise<Evaluation[]> {
    return await db
      .select()
      .from(evaluations)
      .where(eq(evaluations.candidateId, candidateId))
      .orderBy(desc(evaluations.createdAt));
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    const [newEvaluation] = await db
      .insert(evaluations)
      .values(evaluation)
      .returning();
    return newEvaluation;
  }

  async updateEvaluation(id: number, updateData: Partial<InsertEvaluation>): Promise<Evaluation | undefined> {
    const [evaluation] = await db
      .update(evaluations)
      .set(updateData)
      .where(eq(evaluations.id, id))
      .returning();
    return evaluation || undefined;
  }

  async deleteEvaluation(id: number): Promise<boolean> {
    const result = await db.delete(evaluations).where(eq(evaluations.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Documents
  async getDocuments(candidateId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.candidateId, candidateId))
      .orderBy(desc(documents.uploadedAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
