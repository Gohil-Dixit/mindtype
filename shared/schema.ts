import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const uploadedContent = pgTable("uploaded_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceType: varchar("source_type", { length: 20 }).notNull(), // 'paste', 'file', 'drive'
  characterCount: integer("character_count").notNull(),
  wordCount: integer("word_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  contentId: varchar("content_id").notNull().references(() => uploadedContent.id),
  wpm: decimal("wpm", { precision: 6, scale: 2 }).notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).notNull(),
  testDuration: integer("test_duration").notNull(), // seconds
  errorCount: integer("error_count").notNull(),
  correctChars: integer("correct_chars").notNull(),
  totalChars: integer("total_chars").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUploadedContentSchema = createInsertSchema(uploadedContent).omit({
  id: true,
  createdAt: true,
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  completedAt: true,
});

// Types
export type InsertUploadedContent = z.infer<typeof insertUploadedContentSchema>;
export type UploadedContent = typeof uploadedContent.$inferSelect;

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
