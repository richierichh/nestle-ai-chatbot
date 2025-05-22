import { users, type User, type InsertUser, type ChatbotSettings } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getChatbotSettings(): Promise<ChatbotSettings | undefined>;
  saveChatbotSettings(settings: Partial<ChatbotSettings>): Promise<ChatbotSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatbotSettings: ChatbotSettings | undefined;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Initialize default chatbot settings
    this.chatbotSettings = {
      id: 1,
      name: "Nestlé Assistant",
      iconUrl: "/api/chatbot/icon",
      language: "en",
      theme: "red",
      updatedAt: new Date().toISOString()
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getChatbotSettings(): Promise<ChatbotSettings | undefined> {
    return this.chatbotSettings;
  }
  
  async saveChatbotSettings(settings: Partial<ChatbotSettings>): Promise<ChatbotSettings> {
    if (!this.chatbotSettings) {
      this.chatbotSettings = {
        id: 1,
        name: settings.name || "Nestlé Assistant",
        iconUrl: settings.iconUrl || "/api/chatbot/icon",
        language: settings.language || "en",
        theme: settings.theme || "red",
        updatedAt: new Date().toISOString()
      };
    } else {
      this.chatbotSettings = {
        ...this.chatbotSettings,
        ...settings,
        updatedAt: new Date().toISOString()
      };
    }
    
    return this.chatbotSettings;
  }
}

export const storage = new MemStorage();
