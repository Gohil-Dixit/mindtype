import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertUploadedContentSchema, insertLeaderboardEntrySchema } from "@shared/schema";
import { getUncachableGoogleDriveClient } from "./google-drive";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/content/upload", upload.single("file"), async (req, res) => {
    try {
      let content = "";
      let title = "";
      let sourceType = "";

      if (req.file) {
        content = req.file.buffer.toString("utf-8");
        title = req.body.title || req.file.originalname.replace(".txt", "");
        sourceType = "file";
      } else if (req.body.content) {
        content = req.body.content;
        title = req.body.title;
        sourceType = req.body.sourceType || "paste";
      } else {
        return res.status(400).json({ error: "No content provided" });
      }

      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      const characterCount = content.length;

      const validated = insertUploadedContentSchema.parse({
        title,
        content,
        sourceType,
        characterCount,
        wordCount,
      });

      const newContent = await storage.createContent(validated);
      res.json(newContent);
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/content/import-drive", async (req, res) => {
    try {
      const { fileId, title } = req.body;

      if (!fileId) {
        return res.status(400).json({ error: "File ID is required" });
      }

      const drive = await getUncachableGoogleDriveClient();
      
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media',
      }, {
        responseType: 'text'
      });

      const content = response.data as string;
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      const characterCount = content.length;

      const validated = insertUploadedContentSchema.parse({
        title: title || "Imported from Google Drive",
        content,
        sourceType: "drive",
        characterCount,
        wordCount,
      });

      const newContent = await storage.createContent(validated);
      res.json(newContent);
    } catch (error: any) {
      console.error("Google Drive import error:", error);
      res.status(400).json({ error: error.message || "Failed to import from Google Drive" });
    }
  });

  app.get("/api/content", async (req, res) => {
    try {
      const allContent = await storage.getAllContent();
      res.json(allContent);
    } catch (error: any) {
      console.error("Get content error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/content/random", async (req, res) => {
    try {
      const content = await storage.getRandomContent();
      if (!content) {
        const defaultContent = await storage.createContent({
          title: "The Quick Brown Fox",
          content: "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once. It is commonly used for testing typewriters and computer keyboards, displaying examples of fonts, and other applications.",
          sourceType: "paste",
          characterCount: 238,
          wordCount: 42,
        });
        return res.json(defaultContent);
      }
      res.json(content);
    } catch (error: any) {
      console.error("Get random content error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const content = await storage.getContent(req.params.id);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error: any) {
      console.error("Get content by ID error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sessions/submit", async (req, res) => {
    try {
      const validated = insertLeaderboardEntrySchema.parse(req.body);
      const entry = await storage.createLeaderboardEntry(validated);
      
      const leaderboard = await storage.getLeaderboard();
      const rank = leaderboard.findIndex((e) => e.id === entry.id) + 1;

      res.json({ ...entry, rank });
    } catch (error: any) {
      console.error("Submit session error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const sortBy = (req.query.sort_by as string) || "wpm";
      const entries = await storage.getLeaderboard(limit, sortBy);
      res.json(entries);
    } catch (error: any) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/leaderboard/:contentId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const entries = await storage.getLeaderboardByContent(req.params.contentId, limit);
      res.json(entries);
    } catch (error: any) {
      console.error("Get leaderboard by content error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
