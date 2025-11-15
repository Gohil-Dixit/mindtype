import {
  uploadedContent,
  leaderboardEntries,
  type UploadedContent,
  type InsertUploadedContent,
  type LeaderboardEntry,
  type InsertLeaderboardEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createContent(content: InsertUploadedContent): Promise<UploadedContent>;
  getContent(id: string): Promise<UploadedContent | undefined>;
  getAllContent(): Promise<UploadedContent[]>;
  getRandomContent(): Promise<UploadedContent | undefined>;

  createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  getLeaderboard(limit?: number, sortBy?: string): Promise<LeaderboardEntry[]>;
  getLeaderboardByContent(contentId: string, limit?: number): Promise<LeaderboardEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async createContent(insertContent: InsertUploadedContent): Promise<UploadedContent> {
    const [content] = await db
      .insert(uploadedContent)
      .values(insertContent)
      .returning();
    return content;
  }

  async getContent(id: string): Promise<UploadedContent | undefined> {
    const [content] = await db
      .select()
      .from(uploadedContent)
      .where(eq(uploadedContent.id, id));
    return content || undefined;
  }

  async getAllContent(): Promise<UploadedContent[]> {
    return await db
      .select()
      .from(uploadedContent)
      .orderBy(desc(uploadedContent.createdAt));
  }

  async getRandomContent(): Promise<UploadedContent | undefined> {
    const allContent = await this.getAllContent();
    if (allContent.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * allContent.length);
    return allContent[randomIndex];
  }

  async createLeaderboardEntry(insertEntry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const [entry] = await db
      .insert(leaderboardEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async getLeaderboard(limit: number = 100, sortBy: string = "wpm"): Promise<LeaderboardEntry[]> {
    const orderColumn = sortBy === "accuracy" ? leaderboardEntries.accuracy : leaderboardEntries.wpm;
    return await db
      .select()
      .from(leaderboardEntries)
      .orderBy(desc(orderColumn))
      .limit(limit);
  }

  async getLeaderboardByContent(contentId: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    return await db
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.contentId, contentId))
      .orderBy(desc(leaderboardEntries.wpm))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
