import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Chatbot settings schema
export const chatbotSettings = pgTable("chatbot_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Nestlé Assistant"),
  iconUrl: text("icon_url"),
  language: text("language").notNull().default("en"),
  theme: text("theme").notNull().default("red"),
  updatedAt: text("updated_at").notNull()
});

export const insertChatbotSettingsSchema = createInsertSchema(chatbotSettings).pick({
  name: true,
  iconUrl: true,
  language: true,
  theme: true,
});

// Vector content schema
export const vectorContent = pgTable("vector_content", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  embeddings: text("embeddings").notNull(), // JSON string of embeddings
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const insertVectorContentSchema = createInsertSchema(vectorContent).pick({
  url: true,
  title: true,
  content: true,
  embeddings: true,
});

// Graph node schema
export const graphNodes = pgTable("graph_nodes", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  properties: jsonb("properties").notNull().default({}),
  createdAt: text("created_at").notNull(),
});

export const insertGraphNodeSchema = createInsertSchema(graphNodes).pick({
  type: true,
  name: true,
  properties: true,
});

// Graph relationship schema
export const graphRelationships = pgTable("graph_relationships", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  sourceId: integer("source_id").notNull(),
  targetId: integer("target_id").notNull(),
  properties: jsonb("properties").notNull().default({}),
  createdAt: text("created_at").notNull(),
});

export const insertGraphRelationshipSchema = createInsertSchema(graphRelationships).pick({
  type: true,
  sourceId: true,
  targetId: true,
  properties: true,
});

// Chat history schema
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertChatHistorySchema = createInsertSchema(chatHistory).pick({
  sessionId: true,
  role: true,
  content: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChatbotSettings = z.infer<typeof insertChatbotSettingsSchema>;
export type ChatbotSettings = typeof chatbotSettings.$inferSelect;

export type InsertVectorContent = z.infer<typeof insertVectorContentSchema>;
export type VectorContent = typeof vectorContent.$inferSelect;

export type InsertGraphNode = z.infer<typeof insertGraphNodeSchema>;
export type GraphNode = typeof graphNodes.$inferSelect;

export type InsertGraphRelationship = z.infer<typeof insertGraphRelationshipSchema>;
export type GraphRelationship = typeof graphRelationships.$inferSelect;

export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;
