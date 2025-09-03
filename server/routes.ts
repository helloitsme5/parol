import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { fileProcessor } from "./fileProcessor";
import multer from "multer";
import { z } from "zod";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB
  },
});

// Admin role check middleware
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking admin status" });
  }
};

const searchSchema = z.object({
  username: z.string().min(1).max(255),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public search endpoint for users
  app.post('/api/search', isAuthenticated, async (req, res) => {
    try {
      const { username } = searchSchema.parse(req.body);
      
      const count = await storage.getBreachCountByUsername(username);
      
      res.json({ 
        username,
        exposureCount: count,
        message: count > 0 ? 'Username found in data breaches' : 'Username not found in any breaches'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid username" });
      }
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Admin endpoints
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [totalRecords, filesProcessed, queueCount] = await Promise.all([
        storage.getTotalRecords(),
        storage.getTotalFiles(),
        storage.getPendingJobs(),
      ]);

      res.json({
        totalRecords,
        filesProcessed,
        queueCount,
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get('/api/admin/jobs', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const jobs = await storage.getProcessingJobs();
      const processingStatus = fileProcessor.getProcessingStatus();
      
      res.json({
        jobs,
        processingStatus,
      });
    } catch (error) {
      console.error("Jobs error:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post('/api/admin/upload', isAuthenticated, isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      
      // Validate file type
      if (!file.originalname.endsWith('.txt')) {
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: "Only .txt files are allowed" });
      }

      // Create processing job
      const job = await storage.createProcessingJob({
        filename: file.originalname,
        originalSize: formatFileSize(file.size),
        status: 'pending',
        progress: 0,
        recordsProcessed: 0,
      });

      // Start processing in background
      setImmediate(async () => {
        try {
          await fileProcessor.processFile(job.id, file.path);
          // Clean up file after processing
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error("File processing error:", error);
          // Clean up file on error
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      });

      res.json({
        message: "File uploaded successfully",
        jobId: job.id,
        job,
      });
    } catch (error) {
      console.error("Upload error:", error);
      
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: "Upload failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
