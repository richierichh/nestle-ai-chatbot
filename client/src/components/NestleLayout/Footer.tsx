import { Link } from "wouter";
import nestleLogoImg from "@/assets/icons/nestle-icon.svg";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src={nestleLogoImg} 
                alt="Nestlé Logo" 
                className="h-8 w-8 mr-2" 
              />
              <span className="font-bold text-xl">Made With Nestlé</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your personal assistant for all things Nestlé - 
              from recipes and products to nutritional information.
            </p>
          </div>
          
          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products/chocolate">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Chocolate</span>
                </Link>
              </li>
              <li>
                <Link href="/products/ice-cream">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Ice Cream</span>
                </Link>
              </li>
              <li>
                <Link href="/products/coffee">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Coffee</span>
                </Link>
              </li>
              <li>
                <Link href="/products/confectionery">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Confectionery</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Recipes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recipes</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/recipes/desserts">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Desserts</span>
                </Link>
              </li>
              <li>
                <Link href="/recipes/baking">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Baking</span>
                </Link>
              </li>
              <li>
                <Link href="/recipes/holiday">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Holiday</span>
                </Link>
              </li>
              <li>
                <Link href="/recipes/quick-and-easy">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Quick & Easy</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <span className="text-gray-300 hover:text-white cursor-pointer">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Contact</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <span className="text-gray-300 hover:text-white cursor-pointer">Terms of Use</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400">
          <p>© {currentYear} Nestlé. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;