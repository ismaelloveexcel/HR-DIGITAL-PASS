import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCandidateSchema, 
  insertTimelineEntrySchema,
  insertEvaluationSchema,
  insertDocumentSchema 
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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

      const candidate = await storage.updateCandidate(id, req.body);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      
      res.json(candidate);
    } catch (error) {
      console.error("Error updating candidate:", error);
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

      const entry = await storage.updateTimelineEntry(id, req.body);
      if (!entry) {
        return res.status(404).json({ error: "Timeline entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error updating timeline entry:", error);
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

      const evaluation = await storage.updateEvaluation(id, req.body);
      if (!evaluation) {
        return res.status(404).json({ error: "Evaluation not found" });
      }
      
      res.json(evaluation);
    } catch (error) {
      console.error("Error updating evaluation:", error);
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

  return httpServer;
}
