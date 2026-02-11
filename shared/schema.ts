import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  initials: text("initials").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScoreSchema = createInsertSchema(scores).omit({ id: true, createdAt: true }).extend({
  initials: z.string().min(1).max(3).transform((val) => val.toUpperCase()),
  score: z.number().int().min(0),
});

export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type CreateScoreRequest = InsertScore;
export type ScoreResponse = Score;
