import { useState, useEffect } from "react";
import { useChatbot } from "./ChatProvider";

export function ChatbotButton() {
  const { chatVisible, setChatVisible, settings } = useChatbot();
  const [showWelcome, setShowWelcome] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Add a subtle animation to draw attention to the chatbot
  useEffect(() => {
    // Pulse animation after 3 seconds
    const timer = setTimeout(() => {
      setAnimate(true);
      
      // Show welcome message 1 second after animation
      const welcomeTimer = setTimeout(() => {
        setShowWelcome(true);
        
        // Auto-hide welcome message after 5 seconds
        const hideTimer = setTimeout(() => {
          setShowWelcome(false);
        }, 5000);
        
        return () => clearTimeout(hideTimer);
      }, 1000);
      
      return () => clearTimeout(welcomeTimer);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleToggleChat = () => {
    setChatVisible(!chatVisible);
    setShowWelcome(false);
  };

  // Get the button background color based on the theme
  const getButtonBgColor = () => {
    switch (settings.theme) {
      case 'red': return 'bg-red-600 hover:bg-red-700';
      case 'blue': return 'bg-blue-600 hover:bg-blue-700';
      case 'green': return 'bg-green-600 hover:bg-green-700';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700';
      case 'orange': return 'bg-orange-500 hover:bg-orange-600';
      case 'pink': return 'bg-pink-500 hover:bg-pink-600';
      case 'brown': return 'bg-amber-800 hover:bg-amber-900';
      case 'gray': return 'bg-gray-600 hover:bg-gray-700';
      default: return 'bg-red-600 hover:bg-red-700';
    }
  };

  // Get the SVG path fill color based on the icon color setting
  const getIconColor = () => {
    console.log("Icon color setting:", settings.iconColor);
    if (!settings.iconColor) return "#E2001A"; // Default red Nestlé color
    return settings.iconColor;
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 flex flex-col items-end">
      {showWelcome && (
        <div className="bg-white rounded-lg shadow-lg p-3 mb-4 max-w-xs">
          <p className="text-sm">
            👋 Need help with Nestlé products or recipes? Click to chat with {settings.name || "Smartie"}!
          </p>
        </div>
      )}
      <button 
        id="chat-button" 
        className={`${getButtonBgColor()} text-white rounded-full w-16 h-16 flex items-center justify-center 
                  shadow-lg transition-all duration-300 
                  ${animate ? 'scale-110 shadow-2xl' : ''}`}
        onClick={handleToggleChat}
        aria-label={chatVisible ? "Hide chat" : "Show chat"}
        onAnimationEnd={() => setAnimate(false)}
      >
        <div className="w-10 h-10 flex items-center justify-center">
          {settings.customIconUrl ? (
            <img 
              src={settings.customIconUrl} 
              alt={settings.name || "Assistant"}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                // Fallback to the default SVG icon if the custom icon fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 40 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: 'scale(1.1)' }}
            >
              <circle cx="20" cy="20" r="20" fill="#FFFFFF"/>
              <path 
                d="M8 20.84C8 24.42 11.48 27.44 15.76 27.44C20.04 27.44 23.52 24.42 23.52 20.84C23.52 17.26 20.04 14.24 15.76 14.24C11.48 14.24 8 17.26 8 20.84Z" 
                style={{ fill: getIconColor() }}
              />
              <path 
                d="M24.5 20.84C24.5 24.42 27.98 27.44 32.26 27.44C32.26 23.86 28.78 20.84 24.5 20.84Z" 
                style={{ fill: getIconColor() }}
              />
              <path 
                d="M24.5 20.84C24.5 17.26 27.98 14.24 32.26 14.24C32.26 17.82 28.78 20.84 24.5 20.84Z" 
                style={{ fill: getIconColor() }}
              />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
}