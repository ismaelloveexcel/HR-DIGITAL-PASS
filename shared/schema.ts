import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Candidates table
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  department: text("department"),
  location: text("location"),
  status: varchar("status", { length: 20 }).notNull().default('Active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Timeline entries for recruitment stages
export const timelineEntries = pgTable("timeline_entries", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Evaluations/Assessments
export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  score: text("score"),
  notes: text("notes"),
  evaluator: text("evaluator"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  url: text("url"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Relations
export const candidatesRelations = relations(candidates, ({ many }) => ({
  timeline: many(timelineEntries),
  evaluations: many(evaluations),
  documents: many(documents),
}));

export const timelineEntriesRelations = relations(timelineEntries, ({ one }) => ({
  candidate: one(candidates, {
    fields: [timelineEntries.candidateId],
    references: [candidates.id],
  }),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  candidate: one(candidates, {
    fields: [evaluations.candidateId],
    references: [candidates.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  candidate: one(candidates, {
    fields: [documents.candidateId],
    references: [candidates.id],
  }),
}));

// Insert schemas
export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

export const insertTimelineEntrySchema = createInsertSchema(timelineEntries).omit({
  id: true,
  createdAt: true,
});

export const insertEvaluationSchema = createInsertSchema(evaluations).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

// Update schemas (partial versions for PATCH requests)
export const updateCandidateSchema = insertCandidateSchema.partial().omit({
  code: true,
});

export const updateTimelineEntrySchema = insertTimelineEntrySchema.partial().omit({
  candidateId: true,
});

export const updateEvaluationSchema = insertEvaluationSchema.partial().omit({
  candidateId: true,
});

// Types
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type UpdateCandidate = z.infer<typeof updateCandidateSchema>;

export type TimelineEntry = typeof timelineEntries.$inferSelect;
export type InsertTimelineEntry = z.infer<typeof insertTimelineEntrySchema>;
export type UpdateTimelineEntry = z.infer<typeof updateTimelineEntrySchema>;

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type UpdateEvaluation = z.infer<typeof updateEvaluationSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// Full candidate with relations
export type CandidateWithRelations = Candidate & {
  timeline: TimelineEntry[];
  evaluations: Evaluation[];
  documents: Document[];
};

// ============================================================================
// Interview Slots - Real-time slot booking system
// ============================================================================
export const interviewSlots = pgTable("interview_slots", {
  id: serial("id").primaryKey(),
  linkId: varchar("link_id", { length: 50 }).notNull(),
  label: text("label").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('open'),
  managerCode: varchar("manager_code", { length: 20 }).notNull(),
  candidateCode: varchar("candidate_code", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInterviewSlotSchema = createInsertSchema(interviewSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateInterviewSlotSchema = insertInterviewSlotSchema.partial();

export type InterviewSlot = typeof interviewSlots.$inferSelect;
export type InsertInterviewSlot = z.infer<typeof insertInterviewSlotSchema>;
export type UpdateInterviewSlot = z.infer<typeof updateInterviewSlotSchema>;

// ============================================================================
// Pass Settings - Persisted automation toggles per pass
// ============================================================================
export const passSettings = pgTable("pass_settings", {
  id: serial("id").primaryKey(),
  passCode: varchar("pass_code", { length: 20 }).notNull().unique(),
  theme: varchar("theme", { length: 20 }).notNull().default('light'),
  moduleTimeline: boolean("module_timeline").notNull().default(true),
  moduleDocuments: boolean("module_documents").notNull().default(true),
  moduleAvailability: boolean("module_availability").notNull().default(true),
  moduleInteractions: boolean("module_interactions").notNull().default(true),
  automationReminders: boolean("automation_reminders").notNull().default(true),
  automationDocs: boolean("automation_docs").notNull().default(true),
  automationDigest: boolean("automation_digest").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPassSettingsSchema = createInsertSchema(passSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePassSettingsSchema = insertPassSettingsSchema.partial().omit({
  passCode: true,
});

export type PassSettingsRecord = typeof passSettings.$inferSelect;
export type InsertPassSettings = z.infer<typeof insertPassSettingsSchema>;
export type UpdatePassSettings = z.infer<typeof updatePassSettingsSchema>;

// ============================================================================
// Notifications - In-app notifications and reminders
// ============================================================================
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  passCode: varchar("pass_code", { length: 20 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default('normal'),
  read: boolean("read").notNull().default(false),
  actionUrl: text("action_url"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// ============================================================================
// Admin Actions Log - Track admin batch operations
// ============================================================================
export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  targetCodes: text("target_codes").array().notNull(),
  performedBy: varchar("performed_by", { length: 50 }).notNull(),
  payload: jsonb("payload"),
  status: varchar("status", { length: 20 }).notNull().default('completed'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdminActionSchema = createInsertSchema(adminActions).omit({
  id: true,
  createdAt: true,
});

export type AdminAction = typeof adminActions.$inferSelect;
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
