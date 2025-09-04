import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAdmin, getCurrentUser } from "./auth";
import { fileProcessor } from "./fileProcessor";
import multer from "multer";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { loginSchema, createUserSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB
  },
});


const searchSchema = z.object({
  username: z.string().min(1).max(255),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await (storage as any).verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', getCurrentUser, async (req: any, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Public search endpoint for users (no auth required)
  app.post('/api/search', async (req, res) => {
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
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
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

  app.get('/api/admin/jobs', isAdmin, async (req, res) => {
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

  app.post('/api/admin/upload', isAdmin, upload.single('file'), async (req, res) => {
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

  // Admin user management
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords in response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Users fetch error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const userData = createUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("User creation error:", error);
      res.status(500).json({ message: "Failed to create user" });
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
