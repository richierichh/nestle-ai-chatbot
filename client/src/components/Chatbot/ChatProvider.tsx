import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Message, ChatbotSettings } from "@shared/types";
import { apiRequest } from "@/lib/api";

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, "id">) => void;
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  chatVisible: boolean;
  setChatVisible: (visible: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  graphRAGOpen: boolean;
  setGraphRAGOpen: (open: boolean) => void;
  settings: ChatbotSettings;
  updateSettings: (newSettings: Partial<ChatbotSettings>) => void;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: "👋 Hello! I'm the Nestlé Assistant. I can help you discover recipes, find product information, and answer questions about Nestlé products."
    },
    {
      id: "welcome-2",
      role: "assistant",
      content: "How can I assist you today?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [graphRAGOpen, setGraphRAGOpen] = useState(false);
  const [settings, setSettings] = useState<ChatbotSettings>({
    name: "Nestlé Assistant",
    iconUrl: "/api/chatbot/icon", // Default icon URL
    language: "en",
    theme: "red"
  });

  const addMessage = (message: Omit<Message, "id">) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateSettings = (newSettings: Partial<ChatbotSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Here we would save settings to the API
    apiRequest("POST", "/api/chatbot/settings", newSettings)
      .catch(error => console.error("Failed to save settings:", error));
  };

  const sendMessage = async (content: string) => {
    // Add user message to chat
    addMessage({
      role: "user",
      content
    });

    // Show typing indicator
    setIsTyping(true);

    try {
      // Send message to API and get response
      const response = await apiRequest("POST", "/api/chat", { message: content });
      const data = await response.json();

      // Hide typing indicator after a short delay to make it feel more natural
      setTimeout(() => {
        setIsTyping(false);
        
        // Add assistant's response
        addMessage({
          role: "assistant",
          content: data.text,
          references: data.references || []
        });
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      
      // Add error message
      addMessage({
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again."
      });
    }
  };

  // Load settings from API on first load
  useEffect(() => {
    apiRequest("GET", "/api/chatbot/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch((error) => console.error("Failed to load settings:", error));
  }, []);

  const value: ChatContextType = {
    messages,
    addMessage,
    isTyping,
    setIsTyping,
    chatVisible,
    setChatVisible,
    settingsOpen,
    setSettingsOpen,
    graphRAGOpen,
    setGraphRAGOpen,
    settings,
    updateSettings,
    sendMessage
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatbot() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatProvider");
  }
  return context;
}
