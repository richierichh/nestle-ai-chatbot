import { useState, useEffect, useRef } from "react";
import { useChatbot } from "./ChatProvider";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import NestleIcon from "@/assets/icons/nestle-icon.svg";

export function ChatWindow() {
  const { 
    chatVisible, 
    setChatVisible, 
    setSettingsOpen,
    settings
  } = useChatbot();
  
  const windowRef = useRef<HTMLDivElement>(null);
  
  // Animation classes for the chat window
  const [animation, setAnimation] = useState("");
  
  useEffect(() => {
    if (chatVisible) {
      setAnimation("expand-enter");
      setTimeout(() => {
        setAnimation("expand-enter expand-enter-active");
      }, 10);
      setTimeout(() => {
        setAnimation("");
      }, 300);
    }
  }, [chatVisible]);

  // Handle minimize button
  const handleMinimize = () => {
    setChatVisible(false);
  };
  
  // Handle settings button
  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };
  
  // Handle close button
  const handleClose = () => {
    setChatVisible(false);
  };

  if (!chatVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 flex flex-col items-end">
      <div 
        ref={windowRef}
        className={`chat-window rounded-lg bg-white w-full max-w-sm overflow-hidden flex flex-col mb-4 shadow-lg ${animation}`}
      >
        {/* Chat Header */}
        <div 
          className="bg-nestle-red text-white p-4 flex justify-between items-center"
          style={{ backgroundColor: settings.theme === 'red' ? '#E2001A' : 
                                   settings.theme === 'blue' ? '#009FDA' : 
                                   settings.theme === 'green' ? '#009530' : 
                                   settings.theme === 'purple' ? '#7F3F98' : '#E2001A' }}
        >
          <div className="flex items-center">
            {settings.customIconUrl ? (
              <img 
                src={settings.customIconUrl}
                className="w-10 h-10 rounded-full mr-3 border-2 border-white object-cover" 
                alt={settings.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 mr-3 flex items-center justify-center">
                <svg 
                  width="40" 
                  height="40" 
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
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{settings.name}</h3>
              <p className="text-xs opacity-80">Online</p>
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={handleOpenSettings}
              className="text-white mr-2 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button 
              onClick={handleMinimize}
              className="text-white mr-2 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              aria-label="Minimize"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button 
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <ChatMessages />
        
        {/* Chat Input */}
        <ChatInput />
      </div>
    </div>
  );
}
