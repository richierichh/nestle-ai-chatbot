import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processMessage } from "./openai";
import { scrapeMadeWithNestle } from "./services/scraper";
import { searchVectorDb, addToVectorDb } from "./services/vectorDb";
import { addNode, addRelationship, getNodes } from "./services/graphRag";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize storage and services
  await initializeServices();

  // API Routes
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Search vector database for relevant content
      const results = await searchVectorDb(message);

      // Process with OpenAI
      const response = await processMessage(message, results);

      res.json(response);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Chatbot settings endpoints
  app.get("/api/chatbot/settings", async (req, res) => {
    try {
      const settings = await storage.getChatbotSettings();
      res.json(settings || {
        name: "Nestlé Assistant",
        iconUrl: "/api/chatbot/icon",
        language: "en",
        theme: "red"
      });
    } catch (error) {
      console.error("Error fetching chatbot settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/chatbot/settings", async (req, res) => {
    try {
      const settings = req.body;
      await storage.saveChatbotSettings(settings);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving chatbot settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Serve chatbot icon
  app.get("/api/chatbot/icon", (req, res) => {
    const iconPath = path.join(process.cwd(), "client", "src", "assets", "icons", "nestle-icon.svg");
    
    // Check if icon exists, if not use default
    if (fs.existsSync(iconPath)) {
      res.sendFile(iconPath);
    } else {
      // Send a fallback response
      res.type('svg');
      res.send('<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="#E2001A"/><path d="M8 20.84C8 24.42 11.48 27.44 15.76 27.44C20.04 27.44 23.52 24.42 23.52 20.84C23.52 17.26 20.04 14.24 15.76 14.24C11.48 14.24 8 17.26 8 20.84Z" fill="white"/></svg>');
    }
  });

  // Web scraping trigger endpoint
  app.post("/api/scrape", async (req, res) => {
    try {
      const { url } = req.body;
      
      // If URL is provided, scrape specific URL, otherwise scrape the main site
      const scrapedData = await scrapeMadeWithNestle(url || "https://www.madewithnestle.ca/");
      
      // Store scraped data in vector database
      await addToVectorDb(scrapedData);
      
      res.json({ success: true, count: scrapedData.length });
    } catch (error) {
      console.error("Error scraping website:", error);
      res.status(500).json({ error: "Failed to scrape website" });
    }
  });

  // GraphRAG endpoints
  app.get("/api/graph/nodes", async (req, res) => {
    try {
      const nodes = await getNodes();
      res.json(nodes);
    } catch (error) {
      console.error("Error fetching graph nodes:", error);
      res.status(500).json({ error: "Failed to fetch graph nodes" });
    }
  });

  app.post("/api/graph/nodes", async (req, res) => {
    try {
      const { name, type, properties } = req.body;
      
      if (!name || !type) {
        return res.status(400).json({ error: "Name and type are required" });
      }
      
      const node = await addNode(type, name, properties || {});
      res.status(201).json(node);
    } catch (error) {
      console.error("Error adding graph node:", error);
      res.status(500).json({ error: "Failed to add graph node" });
    }
  });

  app.post("/api/graph/relationships", async (req, res) => {
    try {
      const { sourceId, targetId, type, properties } = req.body;
      
      if (!sourceId || !targetId || !type) {
        return res.status(400).json({ error: "Source ID, target ID, and type are required" });
      }
      
      const relationship = await addRelationship(type, sourceId, targetId, properties || {});
      res.status(201).json(relationship);
    } catch (error) {
      console.error("Error adding graph relationship:", error);
      res.status(500).json({ error: "Failed to add graph relationship" });
    }
  });

  return httpServer;
}

// Initialize any required services
async function initializeServices() {
  try {
    // Placeholder for initialization code
    // In a real implementation, this would initialize vector database
    // and graph database connections, load initial data, etc.
    console.log("Initializing services...");
    
    // Initial scrape could happen here
    // await scrapeMadeWithNestle("https://www.madewithnestle.ca/");
  } catch (error) {
    console.error("Error initializing services:", error);
  }
}
