/**
 * HR Digital Pass - Unified Server Entry Point
 * This file merges all server modules into a single file for Replit deployment
 */

import express, { type Request, Response, NextFunction, type Express } from "express";
import { createServer, type Server } from "http";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { WebSocketServer, WebSocket } from 'ws';
import * as schema from "@shared/schema";
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
  insertCandidateSchema, 
  insertTimelineEntrySchema,
  insertEvaluationSchema,
  insertDocumentSchema,
  updateCandidateSchema,
  updateTimelineEntrySchema,
  updateEvaluationSchema,
  insertInterviewSlotSchema,
  updateInterviewSlotSchema,
  insertPassSettingsSchema,
  updatePassSettingsSchema,
  insertNotificationSchema,
  insertAdminActionSchema
} from "@shared/schema";
import { eq, desc, and, lte, isNull } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

// ============================================================================
// DATABASE SETUP
// ============================================================================

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// ============================================================================
// STORAGE LAYER
// ============================================================================

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

// ============================================================================
// WEBSOCKET SETUP
// ============================================================================

interface WSClient {
  ws: WebSocket;
  passCode?: string;
  subscribedLinks: Set<string>;
}

interface WSMessage {
  type: string;
  payload?: any;
  passCode?: string;
  linkId?: string;
}

const clients: Map<WebSocket, WSClient> = new Map();

export function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    const client: WSClient = {
      ws,
      subscribedLinks: new Set(),
    };
    clients.set(ws, client);
    log('WebSocket client connected', 'ws');

    ws.on('message', (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        handleMessage(client, message);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      log('WebSocket client disconnected', 'ws');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: 'connected', data: { timestamp: Date.now() } }));
  });

  log('WebSocket server initialized on /ws', 'ws');
  return wss;
}

function handleMessage(client: WSClient, message: WSMessage) {
  const passCode = message.passCode || message.payload?.passCode;
  const linkId = message.linkId || message.payload?.linkId;

  switch (message.type) {
    case 'subscribe':
      if (passCode) {
        client.passCode = passCode;
      }
      if (linkId) {
        client.subscribedLinks.add(linkId);
      }
      log(`Client subscribed: passCode=${client.passCode}, links=${Array.from(client.subscribedLinks).join(',')}`, 'ws');
      break;

    case 'subscribe_slots':
      if (linkId) {
        client.subscribedLinks.add(linkId);
        log(`Client subscribed to slots: linkId=${linkId}`, 'ws');
      }
      break;

    case 'unsubscribe':
    case 'unsubscribe_slots':
      if (linkId) {
        client.subscribedLinks.delete(linkId);
        log(`Client unsubscribed from: linkId=${linkId}`, 'ws');
      }
      break;

    case 'ping':
      client.ws.send(JSON.stringify({ type: 'pong', data: { timestamp: Date.now() } }));
      break;

    default:
      log(`Unknown WebSocket message type: ${message.type}`, 'ws');
  }
}

export function broadcastSlotUpdate(linkId: string, slot: any) {
  const message = JSON.stringify({
    type: 'slot_update',
    linkId,
    data: slot,
    timestamp: Date.now(),
  });

  let sentCount = 0;
  clients.forEach((client) => {
    if (client.subscribedLinks.has(linkId) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
      sentCount++;
    }
  });

  log(`Broadcast slot update for linkId=${linkId} to ${sentCount} subscribers`, 'ws');
}

export function broadcastSettingsUpdate(passCode: string, settings: any) {
  const message = JSON.stringify({
    type: 'settings_update',
    passCode,
    data: settings,
    timestamp: Date.now(),
  });

  clients.forEach((client) => {
    if (client.passCode === passCode && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

export function broadcastNotification(passCode: string, notification: any) {
  const message = JSON.stringify({
    type: 'notification',
    passCode,
    data: notification,
    timestamp: Date.now(),
  });

  clients.forEach((client) => {
    if (client.passCode === passCode && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

export function broadcastAdminAction(action: any, affectedCodes: string[]) {
  const message = JSON.stringify({
    type: 'admin_action',
    data: action,
    timestamp: Date.now(),
  });

  clients.forEach((client) => {
    if (client.passCode && affectedCodes.includes(client.passCode) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });

  log(`Broadcast admin action to ${affectedCodes.length} affected codes`, 'ws');
}

export function broadcastToAll(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

// ============================================================================
// SCHEDULER
// ============================================================================

const SCHEDULER_INTERVAL = 60000;

export function startReminderScheduler() {
  log('Starting reminder scheduler (checks every 60s)', 'scheduler');
  
  setInterval(async () => {
    try {
      await processScheduledNotifications();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }, SCHEDULER_INTERVAL);
  
  setTimeout(() => processScheduledNotifications(), 5000);
}

async function processScheduledNotifications() {
  try {
    const pendingNotifications = await storage.getPendingScheduledNotifications();
    
    if (pendingNotifications.length === 0) {
      return;
    }
    
    log(`Processing ${pendingNotifications.length} scheduled notifications`, 'scheduler');
    
    for (const notification of pendingNotifications) {
      try {
        await storage.markNotificationSent(notification.id);
        broadcastNotification(notification.passCode, notification);
        log(`Sent scheduled notification ${notification.id} to ${notification.passCode}`, 'scheduler');
      } catch (error) {
        console.error(`Failed to send notification ${notification.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
  }
}

export async function scheduleInterviewReminder(
  passCode: string,
  interviewTitle: string,
  interviewDate: Date,
  reminderMinutesBefore: number = 30
) {
  const reminderTime = new Date(interviewDate.getTime() - reminderMinutesBefore * 60 * 1000);
  
  if (reminderTime <= new Date()) {
    log(`Interview reminder for ${passCode} is in the past, skipping`, 'scheduler');
    return null;
  }
  
  const notification = await storage.createNotification({
    passCode,
    type: 'interview_reminder',
    title: `Reminder: ${interviewTitle}`,
    message: `Your interview "${interviewTitle}" starts in ${reminderMinutesBefore} minutes. Please be prepared.`,
    priority: 'high',
    read: false,
    scheduledFor: reminderTime,
  });
  
  log(`Scheduled interview reminder for ${passCode} at ${reminderTime.toISOString()}`, 'scheduler');
  return notification;
}

export async function scheduleMilestoneReminders(candidateCode: string, timeline: { title: string; date: string; status: string }[]) {
  const reminders = [];
  
  for (const milestone of timeline) {
    if (milestone.status !== 'upcoming' || !milestone.date) continue;
    
    const milestoneDate = new Date(milestone.date);
    if (isNaN(milestoneDate.getTime())) continue;
    
    const reminderDate = new Date(milestoneDate.getTime() - 30 * 60 * 1000);
    
    if (reminderDate > new Date()) {
      const notification = await storage.createNotification({
        passCode: candidateCode,
        type: 'milestone_reminder',
        title: `Upcoming: ${milestone.title}`,
        message: `Your ${milestone.title} is scheduled soon. Please prepare accordingly.`,
        priority: 'high',
        read: false,
        scheduledFor: reminderDate,
      });
      reminders.push(notification);
    }
  }
  
  log(`Scheduled ${reminders.length} milestone reminders for ${candidateCode}`, 'scheduler');
  return reminders;
}

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// ============================================================================
// VITE DEV SERVER
// ============================================================================

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// ============================================================================
// ROUTES
// ============================================================================

async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  setupWebSocket(httpServer);
  startReminderScheduler();
  
  // Candidates
  app.get("/api/candidates", async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });

  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }
      
      const candidate = await storage.getCandidate(id);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      
      res.json(candidate);
    } catch (error) {
      console.error("Error fetching candidate:", error);
      res.status(500).json({ error: "Failed to fetch candidate" });
    }
  });

  app.get("/api/candidates/code/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const candidate = await storage.getCandidateByCode(code);
      
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      
      res.json(candidate);
    } catch (error) {
      console.error("Error fetching candidate by code:", error);
      res.status(500).json({ error: "Failed to fetch candidate" });
    }
  });

  app.post("/api/candidates", async (req, res) => {
    try {
      const validatedData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(validatedData);
      res.status(201).json(candidate);
    } catch (error: any) {
      console.error("Error creating candidate:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid candidate data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create candidate" });
    }
  });

  app.patch("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }

      const validatedData = updateCandidateSchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const candidate = await storage.updateCandidate(id, validatedData);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      
      res.json(candidate);
    } catch (error: any) {
      console.error("Error updating candidate:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update candidate" });
    }
  });

  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }

      const success = await storage.deleteCandidate(id);
      if (!success) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      res.status(500).json({ error: "Failed to delete candidate" });
    }
  });

  // Timeline Entries
  app.get("/api/candidates/:candidateId/timeline", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      if (isNaN(candidateId)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }
      
      const timeline = await storage.getTimelineEntries(candidateId);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ error: "Failed to fetch timeline" });
    }
  });

  app.post("/api/candidates/:candidateId/timeline", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      if (isNaN(candidateId)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }

      const validatedData = insertTimelineEntrySchema.parse({
        ...req.body,
        candidateId
      });
      
      const entry = await storage.createTimelineEntry(validatedData);
      res.status(201).json(entry);
    } catch (error: any) {
      console.error("Error creating timeline entry:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid timeline data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create timeline entry" });
    }
  });

  app.patch("/api/timeline/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid timeline entry ID" });
      }

      const validatedData = updateTimelineEntrySchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const entry = await storage.updateTimelineEntry(id, validatedData);
      if (!entry) {
        return res.status(404).json({ error: "Timeline entry not found" });
      }
      
      res.json(entry);
    } catch (error: any) {
      console.error("Error updating timeline entry:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update timeline entry" });
    }
  });

  app.delete("/api/timeline/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid timeline entry ID" });
      }

      const success = await storage.deleteTimelineEntry(id);
      if (!success) {
        return res.status(404).json({ error: "Timeline entry not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting timeline entry:", error);
      res.status(500).json({ error: "Failed to delete timeline entry" });
    }
  });

  // Evaluations
  app.get("/api/candidates/:candidateId/evaluations", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      if (isNaN(candidateId)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }
      
      const evaluations = await storage.getEvaluations(candidateId);
      res.json(evaluations);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      res.status(500).json({ error: "Failed to fetch evaluations" });
    }
  });

  app.post("/api/candidates/:candidateId/evaluations", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      if (isNaN(candidateId)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }

      const validatedData = insertEvaluationSchema.parse({
        ...req.body,
        candidateId
      });
      
      const evaluation = await storage.createEvaluation(validatedData);
      res.status(201).json(evaluation);
    } catch (error: any) {
      console.error("Error creating evaluation:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid evaluation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create evaluation" });
    }
  });

  app.patch("/api/evaluations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid evaluation ID" });
      }

      const validatedData = updateEvaluationSchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const evaluation = await storage.updateEvaluation(id, validatedData);
      if (!evaluation) {
        return res.status(404).json({ error: "Evaluation not found" });
      }
      
      res.json(evaluation);
    } catch (error: any) {
      console.error("Error updating evaluation:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update evaluation" });
    }
  });

  app.delete("/api/evaluations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid evaluation ID" });
      }

      const success = await storage.deleteEvaluation(id);
      if (!success) {
        return res.status(404).json({ error: "Evaluation not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      res.status(500).json({ error: "Failed to delete evaluation" });
    }
  });

  // Documents
  app.get("/api/candidates/:candidateId/documents", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      if (isNaN(candidateId)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }
      
      const documents = await storage.getDocuments(candidateId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/candidates/:candidateId/documents", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      if (isNaN(candidateId)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }

      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        candidateId
      });
      
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error: any) {
      console.error("Error creating document:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid document data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }

      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // ============================================================================
  // Interview Slots - Real-time slot booking
  // ============================================================================
  app.get("/api/slots/link/:linkId", async (req, res) => {
    try {
      const slots = await storage.getSlotsByLinkId(req.params.linkId);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      res.status(500).json({ error: "Failed to fetch slots" });
    }
  });

  app.get("/api/slots/manager/:managerCode", async (req, res) => {
    try {
      const slots = await storage.getSlotsByManager(req.params.managerCode);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching manager slots:", error);
      res.status(500).json({ error: "Failed to fetch slots" });
    }
  });

  app.get("/api/slots/candidate/:candidateCode", async (req, res) => {
    try {
      const slots = await storage.getSlotsByCandidate(req.params.candidateCode);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching candidate slots:", error);
      res.status(500).json({ error: "Failed to fetch slots" });
    }
  });

  app.post("/api/slots", async (req, res) => {
    try {
      const validatedData = insertInterviewSlotSchema.parse(req.body);
      const slot = await storage.createSlot(validatedData);
      broadcastSlotUpdate(slot.linkId, slot);
      res.status(201).json(slot);
    } catch (error: any) {
      console.error("Error creating slot:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid slot data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create slot" });
    }
  });

  app.patch("/api/slots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid slot ID" });
      }

      const validatedData = updateInterviewSlotSchema.parse(req.body);
      const slot = await storage.updateSlot(id, validatedData);
      
      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }
      
      broadcastSlotUpdate(slot.linkId, slot);
      res.json(slot);
    } catch (error: any) {
      console.error("Error updating slot:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid slot data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update slot" });
    }
  });

  app.delete("/api/slots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid slot ID" });
      }

      const success = await storage.deleteSlot(id);
      if (!success) {
        return res.status(404).json({ error: "Slot not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting slot:", error);
      res.status(500).json({ error: "Failed to delete slot" });
    }
  });

  // ============================================================================
  // Pass Settings - Automation toggles persistence
  // ============================================================================
  app.get("/api/settings/:passCode", async (req, res) => {
    try {
      const settings = await storage.getPassSettings(req.params.passCode);
      if (!settings) {
        const defaults = {
          passCode: req.params.passCode,
          theme: 'light',
          moduleTimeline: true,
          moduleDocuments: true,
          moduleAvailability: true,
          moduleInteractions: true,
          automationReminders: true,
          automationDocs: true,
          automationDigest: false,
        };
        const created = await storage.upsertPassSettings(defaults);
        return res.json(created);
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings/:passCode", async (req, res) => {
    try {
      const validatedData = insertPassSettingsSchema.parse({
        ...req.body,
        passCode: req.params.passCode,
      });
      const settings = await storage.upsertPassSettings(validatedData);
      broadcastSettingsUpdate(req.params.passCode, settings);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating settings:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid settings data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.patch("/api/settings/:passCode", async (req, res) => {
    try {
      const validatedData = updatePassSettingsSchema.parse(req.body);
      
      let settings = await storage.getPassSettings(req.params.passCode);
      if (!settings) {
        const defaults = {
          passCode: req.params.passCode,
          theme: 'light',
          moduleTimeline: true,
          moduleDocuments: true,
          moduleAvailability: true,
          moduleInteractions: true,
          automationReminders: true,
          automationDocs: true,
          automationDigest: false,
          ...validatedData,
        };
        settings = await storage.upsertPassSettings(defaults);
      } else {
        const updated = await storage.updatePassSettings(req.params.passCode, validatedData);
        if (updated) settings = updated;
      }
      
      broadcastSettingsUpdate(req.params.passCode, settings);
      res.json(settings);
    } catch (error: any) {
      console.error("Error patching settings:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid settings data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to patch settings" });
    }
  });

  // ============================================================================
  // Notifications - In-app messaging system
  // ============================================================================
  app.get("/api/notifications/:passCode", async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.params.passCode);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/:passCode/unread", async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications(req.params.passCode);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      
      if (!notification.scheduledFor || new Date(notification.scheduledFor) <= new Date()) {
        broadcastNotification(notification.passCode, notification);
      }
      
      res.status(201).json(notification);
    } catch (error: any) {
      console.error("Error creating notification:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid notification data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid notification ID" });
      }

      const notification = await storage.markNotificationRead(id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // ============================================================================
  // Admin Actions - Batch operations and broadcasts
  // ============================================================================
  app.get("/api/admin/actions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const actions = await storage.getAdminActions(limit);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching admin actions:", error);
      res.status(500).json({ error: "Failed to fetch admin actions" });
    }
  });

  app.post("/api/admin/batch-onboard", async (req, res) => {
    try {
      const { candidateCodes, performedBy } = req.body;
      
      if (!Array.isArray(candidateCodes) || candidateCodes.length === 0) {
        return res.status(400).json({ error: "candidateCodes array is required" });
      }

      const results = [];
      for (const code of candidateCodes) {
        const candidate = await storage.getCandidateByCode(code);
        if (candidate) {
          await storage.updateCandidate(candidate.id, { status: 'Onboarding' });
          
          await storage.createNotification({
            passCode: code,
            type: 'onboarding',
            title: 'Welcome to Onboarding!',
            message: 'Your onboarding process has begun. Check your timeline for next steps.',
            priority: 'high',
            read: false,
          });
          
          results.push({ code, status: 'onboarded' });
        } else {
          results.push({ code, status: 'not_found' });
        }
      }

      const action = await storage.createAdminAction({
        actionType: 'batch_onboard',
        targetCodes: candidateCodes,
        performedBy: performedBy || 'admin',
        payload: { results },
        status: 'completed',
      });

      broadcastAdminAction(action, candidateCodes);
      res.json({ action, results });
    } catch (error) {
      console.error("Error in batch onboard:", error);
      res.status(500).json({ error: "Failed to perform batch onboarding" });
    }
  });

  app.post("/api/admin/broadcast", async (req, res) => {
    try {
      const { targetCodes, title, message, priority, performedBy } = req.body;
      
      if (!Array.isArray(targetCodes) || targetCodes.length === 0) {
        return res.status(400).json({ error: "targetCodes array is required" });
      }
      if (!title || !message) {
        return res.status(400).json({ error: "title and message are required" });
      }

      const notifications = [];
      for (const code of targetCodes) {
        const notification = await storage.createNotification({
          passCode: code,
          type: 'broadcast',
          title,
          message,
          priority: priority || 'normal',
          read: false,
        });
        notifications.push(notification);
        broadcastNotification(code, notification);
      }

      const action = await storage.createAdminAction({
        actionType: 'broadcast',
        targetCodes,
        performedBy: performedBy || 'admin',
        payload: { title, message, notificationCount: notifications.length },
        status: 'completed',
      });

      res.json({ action, notificationCount: notifications.length });
    } catch (error) {
      console.error("Error in broadcast:", error);
      res.status(500).json({ error: "Failed to send broadcast" });
    }
  });

  app.post("/api/admin/schedule-reminder", async (req, res) => {
    try {
      const { passCode, title, message, scheduledFor, priority } = req.body;
      
      if (!passCode || !title || !message || !scheduledFor) {
        return res.status(400).json({ error: "passCode, title, message, and scheduledFor are required" });
      }

      const notification = await storage.createNotification({
        passCode,
        type: 'reminder',
        title,
        message,
        priority: priority || 'normal',
        read: false,
        scheduledFor: new Date(scheduledFor),
      });

      res.status(201).json(notification);
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      res.status(500).json({ error: "Failed to schedule reminder" });
    }
  });

  app.post("/api/admin/milestone-reminders/:candidateId", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      if (isNaN(candidateId)) {
        return res.status(400).json({ error: "Invalid candidate ID" });
      }

      const candidate = await storage.getCandidate(candidateId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      const upcomingTimeline = candidate.timeline.filter(t => t.status === 'upcoming' && t.date);
      const reminders = [];

      for (const milestone of upcomingTimeline) {
        const milestoneDate = new Date(milestone.date);
        // Validate that the date is valid before proceeding
        if (isNaN(milestoneDate.getTime())) {
          continue;
        }
        
        const reminderDate = new Date(milestoneDate.getTime() - 30 * 60 * 1000);
        
        if (reminderDate > new Date()) {
          const notification = await storage.createNotification({
            passCode: candidate.code,
            type: 'milestone_reminder',
            title: `Upcoming: ${milestone.title}`,
            message: `Your ${milestone.title} is scheduled for ${milestone.date}. Please prepare accordingly.`,
            priority: 'high',
            read: false,
            scheduledFor: reminderDate,
          });
          reminders.push(notification);
        }
      }

      res.json({ 
        candidateCode: candidate.code, 
        remindersScheduled: reminders.length,
        reminders 
      });
    } catch (error) {
      console.error("Error creating milestone reminders:", error);
      res.status(500).json({ error: "Failed to create reminders" });
    }
  });

  return httpServer;
}

// ============================================================================
// EXPRESS APP AND SERVER SETUP
// ============================================================================

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
