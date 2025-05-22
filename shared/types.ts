export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: Array<{ url: string; title: string }>;
}

export interface ChatbotSettings {
  name: string;
  iconUrl?: string;
  customIconUrl?: string;
  iconColor?: string;
  language: string;
  theme: string;
}

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
}

export interface GraphNode {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: string;
  sourceId: string;
  targetId: string;
  properties: Record<string, any>;
}

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  text: string;
  references?: Array<{ url: string; title: string }>;
}
