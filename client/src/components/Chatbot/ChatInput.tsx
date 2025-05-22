import { useState } from "react";
import { useChatbot } from "./ChatProvider";

export function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage } = useChatbot();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    
    // Clear input field
    setInput("");
    
    // Send message to chat provider
    await sendMessage(trimmedInput);
  };
  
  return (
    <div className="border-t border-gray-200 p-3">
      <form 
        id="chat-form" 
        className="flex items-center gap-2"
        onSubmit={handleSubmit}
      >
        <input 
          type="text" 
          id="user-input" 
          placeholder="Type your message here..." 
          className="flex-grow p-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nestle-red"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          type="submit" 
          className="bg-nestle-red text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-700 transition"
          aria-label="Send message"
        >
          <i className="fa fa-paper-plane"></i>
        </button>
      </form>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">Powered by Nestlé AI</p>
      </div>
    </div>
  );
}
