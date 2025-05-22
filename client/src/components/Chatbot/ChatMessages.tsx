import { useRef, useEffect } from "react";
import { useChatbot } from "./ChatProvider";
import NestleIcon from "@/assets/icons/nestle-icon.svg";

export function ChatMessages() {
  const { messages, isTyping, settings } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  
  // Debug messages
  useEffect(() => {
    console.log("Current messages:", messages);
  }, [messages]);

  return (
    <div 
      id="chat-messages" 
      className="p-4 overflow-y-auto flex-grow flex flex-col space-y-4" 
      style={{ height: "350px" }}
    >
      {/* Display all messages */}
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={message.role === "user" ? "flex items-end justify-end" : "flex items-end space-x-2"}
        >
          {message.role === "assistant" && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white">
              {settings.customIconUrl ? (
                <img 
                  src={settings.customIconUrl}
                  className="w-8 h-8 rounded-full object-cover" 
                  alt={settings.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 40 40" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="20" cy="20" r="20" fill="#FFFFFF"/>
                  <path 
                    d="M8 20.84C8 24.42 11.48 27.44 15.76 27.44C20.04 27.44 23.52 24.42 23.52 20.84C23.52 17.26 20.04 14.24 15.76 14.24C11.48 14.24 8 17.26 8 20.84Z" 
                    style={{ fill: settings.iconColor || "#E2001A" }}
                  />
                  <path 
                    d="M24.5 20.84C24.5 24.42 27.98 27.44 32.26 27.44C32.26 23.86 28.78 20.84 24.5 20.84Z" 
                    style={{ fill: settings.iconColor || "#E2001A" }}
                  />
                  <path 
                    d="M24.5 20.84C24.5 17.26 27.98 14.24 32.26 14.24C32.26 17.82 28.78 20.84 24.5 20.84Z" 
                    style={{ fill: settings.iconColor || "#E2001A" }}
                  />
                </svg>
              )}
            </div>
          )}
          
          <div 
            className={
              message.role === "user" 
              ? "chat-bubble user-bubble bg-blue-600 text-white rounded-t-lg rounded-l-lg p-3 shadow-sm max-w-[75%]"
              : "chat-bubble bot-bubble bg-gray-100 rounded-t-lg rounded-r-lg p-3 shadow-sm max-w-[75%]"
            }
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            
            {/* References section for links */}
            {message.references && message.references.length > 0 && (
              <div className="mt-3 p-2 bg-gray-100 rounded-lg text-sm">
                <p className="font-medium text-gray-800">Reference:</p>
                {message.references.map((ref, index) => (
                  <a 
                    key={index}
                    href={ref.url} 
                    className="text-blue-600 hover:underline block" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ref.title || ref.url}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-end space-x-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white">
            {settings.customIconUrl ? (
              <img 
                src={settings.customIconUrl}
                className="w-8 h-8 rounded-full object-cover" 
                alt={settings.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="20" cy="20" r="20" fill="#FFFFFF"/>
                <path 
                  d="M8 20.84C8 24.42 11.48 27.44 15.76 27.44C20.04 27.44 23.52 24.42 23.52 20.84C23.52 17.26 20.04 14.24 15.76 14.24C11.48 14.24 8 17.26 8 20.84Z" 
                  style={{ fill: settings.iconColor || "#E2001A" }}
                />
                <path 
                  d="M24.5 20.84C24.5 24.42 27.98 27.44 32.26 27.44C32.26 23.86 28.78 20.84 24.5 20.84Z" 
                  style={{ fill: settings.iconColor || "#E2001A" }}
                />
                <path 
                  d="M24.5 20.84C24.5 17.26 27.98 14.24 32.26 14.24C32.26 17.82 28.78 20.84 24.5 20.84Z" 
                  style={{ fill: settings.iconColor || "#E2001A" }}
                />
              </svg>
            )}
          </div>
          <div className="bg-gray-100 rounded-full py-2 px-4">
            <div className="typing-indicator flex space-x-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></span>
            </div>
          </div>
        </div>
      )}
      
      {/* Element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
