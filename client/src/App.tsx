import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import NestleHomePage from "@/pages/NestleHomePage";
import { ChatProvider } from "./components/Chatbot/ChatProvider";
import { ChatbotButton } from "./components/Chatbot/ChatbotButton";
import { ChatWindow } from "./components/Chatbot/ChatWindow";
import { SettingsPanel } from "./components/Chatbot/SettingsPanel";
import { GraphRAGPanel } from "./components/Chatbot/GraphRAGPanel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={NestleHomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatProvider>
          {/* Main application */}
          <Toaster />
          <Router />
          
          {/* Chatbot components */}
          <ChatbotButton />
          <ChatWindow />
          <SettingsPanel />
          <GraphRAGPanel />
        </ChatProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
