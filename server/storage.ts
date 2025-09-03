import {
  users,
  breachRecords,
  processingJobs,
  type User,
  type UpsertUser,
  type InsertBreachRecord,
  type BreachRecord,
  type InsertProcessingJob,
  type ProcessingJob,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, count, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Breach record operations
  createBreachRecord(record: InsertBreachRecord): Promise<BreachRecord>;
  getBreachCountByUsername(username: string): Promise<number>;
  
  // Processing job operations
  createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob>;
  updateProcessingJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob>;
  getProcessingJobs(): Promise<ProcessingJob[]>;
  getProcessingJob(id: string): Promise<ProcessingJob | undefined>;
  
  // Statistics
  getTotalRecords(): Promise<number>;
  getTotalFiles(): Promise<number>;
  getPendingJobs(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createBreachRecord(record: InsertBreachRecord): Promise<BreachRecord> {
    const [breachRecord] = await db
      .insert(breachRecords)
      .values(record)
      .returning();
    return breachRecord;
  }

  async getBreachCountByUsername(username: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(breachRecords)
      .where(eq(breachRecords.username, username));
    
    return result[0]?.count || 0;
  }

  async createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob> {
    const [processingJob] = await db
      .insert(processingJobs)
      .values(job)
      .returning();
    return processingJob;
  }

  async updateProcessingJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob> {
    const [job] = await db
      .update(processingJobs)
      .set(updates)
      .where(eq(processingJobs.id, id))
      .returning();
    return job;
  }

  async getProcessingJobs(): Promise<ProcessingJob[]> {
    return db
      .select()
      .from(processingJobs)
      .orderBy(desc(processingJobs.createdAt))
      .limit(20);
  }

  async getProcessingJob(id: string): Promise<ProcessingJob | undefined> {
    const [job] = await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.id, id));
    return job;
  }

  async getTotalRecords(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(breachRecords);
    
    return result[0]?.count || 0;
  }

  async getTotalFiles(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(processingJobs)
      .where(eq(processingJobs.status, "completed"));
    
    return result[0]?.count || 0;
  }

  async getPendingJobs(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(processingJobs)
      .where(sql`${processingJobs.status} IN ('pending', 'processing')`);
    
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();
