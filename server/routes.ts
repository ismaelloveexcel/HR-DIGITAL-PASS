import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
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
import { setupWebSocket, broadcastSlotUpdate, broadcastSettingsUpdate, broadcastNotification, broadcastAdminAction } from "./websocket";
import { startReminderScheduler } from "./scheduler";

export async function registerRoutes(
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
