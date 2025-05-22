import { Link } from "wouter";
import { useState } from "react";
import NestleLayout from "@/components/NestleLayout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatbot } from "@/components/Chatbot/ChatProvider";

// Import Nestlé product images - these would be replaced with actual Nestlé product images
import nestleLogoImg from "@/assets/icons/nestle-icon.svg";

export default function NestleHomePage() {
  const [email, setEmail] = useState("");
  const { setChatVisible } = useChatbot();
  
  const openChatbot = () => {
    setChatVisible(true);
  };
  
  return (
    <NestleLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Made With Nestlé Assistant
              </h1>
              <p className="text-xl mb-8">
                Your personal guide to all things Nestlé - from recipes and products 
                to nutritional information and cooking tips.
              </p>
              <Button 
                onClick={openChatbot}
                className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-full font-medium"
              >
                Ask Smartie Now
              </Button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/screenshot-chatbot.png" 
                alt="Nestlé Chatbot Interface" 
                className="rounded-lg shadow-xl max-w-md w-full"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=Nestl%C3%A9+Chatbot";
                }}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ask Smartie About</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-red-600 text-4xl mb-4">🍫</div>
              <h3 className="text-xl font-semibold mb-2">Product Information</h3>
              <p className="text-gray-600 mb-4">
                Get detailed information about any Nestlé product, including nutritional facts, ingredients, and more.
              </p>
              <Button 
                onClick={openChatbot}
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Ask About Products
              </Button>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-red-600 text-4xl mb-4">🍪</div>
              <h3 className="text-xl font-semibold mb-2">Delicious Recipes</h3>
              <p className="text-gray-600 mb-4">
                Discover amazing recipes using Nestlé products, with step-by-step instructions and cooking tips.
              </p>
              <Button 
                onClick={openChatbot}
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Find Recipes
              </Button>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-red-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Nutrition Guide</h3>
              <p className="text-gray-600 mb-4">
                Learn about the nutritional content of Nestlé products with exact calorie counts and nutrient details.
              </p>
              <Button 
                onClick={openChatbot}
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Check Nutrition Facts
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Brands Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <BrandCard name="KitKat" emoji="🍫" onClick={openChatbot} />
            <BrandCard name="Aero" emoji="🫧" onClick={openChatbot} />
            <BrandCard name="Coffee Crisp" emoji="☕" onClick={openChatbot} />
            <BrandCard name="Smarties" emoji="🍬" onClick={openChatbot} />
            <BrandCard name="Drumstick" emoji="🍦" onClick={openChatbot} />
            <BrandCard name="Quality Street" emoji="🎁" onClick={openChatbot} />
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-4">Stay Updated</h2>
            <p className="text-center text-gray-600 mb-8">
              Subscribe to our newsletter for the latest recipes, product news, and special offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="bg-red-600 hover:bg-red-700 sm:w-auto w-full">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </NestleLayout>
  );
}

// Brand Card Component
function BrandCard({ name, emoji, onClick }: { name: string; emoji: string; onClick: () => void }) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer text-center"
      onClick={onClick}
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="font-medium">{name}</h3>
    </div>
  );
}