import { 
  candidates, 
  timelineEntries,
  evaluations,
  documents,
  interviewSlots,
  passSettings,
  notifications,
  adminActions,
  type Candidate,
  type InsertCandidate,
  type TimelineEntry,
  type InsertTimelineEntry,
  type Evaluation,
  type InsertEvaluation,
  type Document,
  type InsertDocument,
  type CandidateWithRelations,
  type InterviewSlot,
  type InsertInterviewSlot,
  type UpdateInterviewSlot,
  type PassSettingsRecord,
  type InsertPassSettings,
  type UpdatePassSettings,
  type Notification,
  type InsertNotification,
  type AdminAction,
  type InsertAdminAction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lte, isNull, sql } from "drizzle-orm";

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

  // Interview Slots
  getSlotsByLinkId(linkId: string): Promise<InterviewSlot[]>;
  getSlotsByManager(managerCode: string): Promise<InterviewSlot[]>;
  getSlotsByCandidate(candidateCode: string): Promise<InterviewSlot[]>;
  createSlot(slot: InsertInterviewSlot): Promise<InterviewSlot>;
  updateSlot(id: number, slot: UpdateInterviewSlot): Promise<InterviewSlot | undefined>;
  deleteSlot(id: number): Promise<boolean>;

  // Pass Settings
  getPassSettings(passCode: string): Promise<PassSettingsRecord | undefined>;
  upsertPassSettings(settings: InsertPassSettings): Promise<PassSettingsRecord>;
  updatePassSettings(passCode: string, settings: UpdatePassSettings): Promise<PassSettingsRecord | undefined>;

  // Notifications
  getNotifications(passCode: string): Promise<Notification[]>;
  getUnreadNotifications(passCode: string): Promise<Notification[]>;
  getPendingScheduledNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification | undefined>;
  markNotificationSent(id: number): Promise<Notification | undefined>;

  // Admin Actions
  createAdminAction(action: InsertAdminAction): Promise<AdminAction>;
  getAdminActions(limit?: number): Promise<AdminAction[]>;
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

  // Interview Slots
  async getSlotsByLinkId(linkId: string): Promise<InterviewSlot[]> {
    return await db
      .select()
      .from(interviewSlots)
      .where(eq(interviewSlots.linkId, linkId))
      .orderBy(interviewSlots.date, interviewSlots.time);
  }

  async getSlotsByManager(managerCode: string): Promise<InterviewSlot[]> {
    return await db
      .select()
      .from(interviewSlots)
      .where(eq(interviewSlots.managerCode, managerCode))
      .orderBy(interviewSlots.date, interviewSlots.time);
  }

  async getSlotsByCandidate(candidateCode: string): Promise<InterviewSlot[]> {
    return await db
      .select()
      .from(interviewSlots)
      .where(eq(interviewSlots.candidateCode, candidateCode))
      .orderBy(interviewSlots.date, interviewSlots.time);
  }

  async createSlot(slot: InsertInterviewSlot): Promise<InterviewSlot> {
    const [newSlot] = await db
      .insert(interviewSlots)
      .values(slot)
      .returning();
    return newSlot;
  }

  async updateSlot(id: number, updateData: UpdateInterviewSlot): Promise<InterviewSlot | undefined> {
    const [slot] = await db
      .update(interviewSlots)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(interviewSlots.id, id))
      .returning();
    return slot || undefined;
  }

  async deleteSlot(id: number): Promise<boolean> {
    const result = await db.delete(interviewSlots).where(eq(interviewSlots.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Pass Settings
  async getPassSettings(passCode: string): Promise<PassSettingsRecord | undefined> {
    const [settings] = await db
      .select()
      .from(passSettings)
      .where(eq(passSettings.passCode, passCode));
    return settings || undefined;
  }

  async upsertPassSettings(settings: InsertPassSettings): Promise<PassSettingsRecord> {
    const existing = await this.getPassSettings(settings.passCode);
    if (existing) {
      const { passCode, ...updateData } = settings;
      const [updated] = await db
        .update(passSettings)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(passSettings.passCode, passCode))
        .returning();
      return updated;
    }
    const [newSettings] = await db
      .insert(passSettings)
      .values(settings)
      .returning();
    return newSettings;
  }

  async updatePassSettings(passCode: string, updateData: UpdatePassSettings): Promise<PassSettingsRecord | undefined> {
    const [settings] = await db
      .update(passSettings)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(passSettings.passCode, passCode))
      .returning();
    return settings || undefined;
  }

  // Notifications
  async getNotifications(passCode: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.passCode, passCode))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(passCode: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.passCode, passCode),
        eq(notifications.read, false)
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async getPendingScheduledNotifications(): Promise<Notification[]> {
    const now = new Date();
    return await db
      .select()
      .from(notifications)
      .where(and(
        lte(notifications.scheduledFor, now),
        isNull(notifications.sentAt)
      ))
      .orderBy(notifications.scheduledFor);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification || undefined;
  }

  async markNotificationSent(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ sentAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification || undefined;
  }

  // Admin Actions
  async createAdminAction(action: InsertAdminAction): Promise<AdminAction> {
    const [newAction] = await db
      .insert(adminActions)
      .values(action)
      .returning();
    return newAction;
  }

  async getAdminActions(limit: number = 50): Promise<AdminAction[]> {
    return await db
      .select()
      .from(adminActions)
      .orderBy(desc(adminActions.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
