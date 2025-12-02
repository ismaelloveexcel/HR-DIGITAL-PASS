import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp } from "drizzle-orm/pg-core";
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
