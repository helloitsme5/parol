import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"), // 'user' or 'admin'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Breach records table - stores processed breach data
export const breachRecords = pgTable("breach_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull(),
  domain: varchar("domain").notNull(),
  subdomain: varchar("subdomain"),
  passwordHash: text("password_hash").notNull(),
  sourceFile: varchar("source_file").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_breach_username").on(table.username),
  index("idx_breach_domain").on(table.domain),
]);

// File processing jobs table
export const processingJobs = pgTable("processing_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: varchar("filename").notNull(),
  originalSize: varchar("original_size").notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  progress: integer("progress").notNull().default(0),
  recordsProcessed: integer("records_processed").notNull().default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Create schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertBreachRecordSchema = createInsertSchema(breachRecords).pick({
  username: true,
  domain: true,
  subdomain: true,
  passwordHash: true,
  sourceFile: true,
});

export const insertProcessingJobSchema = createInsertSchema(processingJobs).pick({
  filename: true,
  originalSize: true,
  status: true,
  progress: true,
  recordsProcessed: true,
  errorMessage: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertBreachRecord = z.infer<typeof insertBreachRecordSchema>;
export type BreachRecord = typeof breachRecords.$inferSelect;
export type InsertProcessingJob = z.infer<typeof insertProcessingJobSchema>;
export type ProcessingJob = typeof processingJobs.$inferSelect;
