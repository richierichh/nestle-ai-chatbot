import { Link } from "wouter";
import { useChatbot } from "@/components/Chatbot/ChatProvider";
import { Button } from "@/components/ui/button";
import nestleLogoImg from "@/assets/icons/nestle-icon.svg";

const Header = () => {
  const { setChatVisible } = useChatbot();
  
  const openChatbot = () => {
    setChatVisible(true);
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <img 
                  src={nestleLogoImg} 
                  alt="Nestlé Logo" 
                  className="h-8 w-8 mr-2" 
                />
                <span className="text-red-600 font-bold text-xl">Made With Nestlé</span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <Link href="/products">
              <span className="text-gray-700 hover:text-red-600 cursor-pointer">Products</span>
            </Link>
            <Link href="/recipes">
              <span className="text-gray-700 hover:text-red-600 cursor-pointer">Recipes</span>
            </Link>
            <Link href="/brands">
              <span className="text-gray-700 hover:text-red-600 cursor-pointer">Brands</span>
            </Link>
            <Link href="/about">
              <span className="text-gray-700 hover:text-red-600 cursor-pointer">About</span>
            </Link>
          </nav>
          
          <div>
            <Button 
              onClick={openChatbot}
              className="bg-red-600 hover:bg-red-700"
            >
              Ask Smartie
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;