import { useState } from "react";
import { ChatbotButton } from "@/components/Chatbot/ChatbotButton";
import { ChatWindow } from "@/components/Chatbot/ChatWindow";
import { SettingsPanel } from "@/components/Chatbot/SettingsPanel";
import { GraphRAGPanel } from "@/components/Chatbot/GraphRAGPanel";
import { useChatbot } from "@/components/Chatbot/ChatProvider";
import WebsiteScreenshot from "@/assets/icons/website-screenshot.svg";

export default function Home() {
  const { settingsOpen, graphRAGOpen } = useChatbot();

  return (
    <div className="relative min-h-screen w-full bg-white">
      {/* Website Background */}
      <div className="fixed inset-0 w-full h-full">
        <img 
          src={WebsiteScreenshot} 
          className="w-full h-full object-cover opacity-50" 
          alt="Made with Nestlé website" 
        />
      </div>

      {/* Chatbot Components */}
      <ChatbotButton />
      <ChatWindow />
      
      {/* Panels that appear on top */}
      {settingsOpen && <SettingsPanel />}
      {graphRAGOpen && <GraphRAGPanel />}
    </div>
  );
}
