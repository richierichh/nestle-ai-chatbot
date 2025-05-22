import { useState, useEffect } from "react";
import { useChatbot } from "./ChatProvider";
import NestleIcon from "@/assets/icons/nestle-icon.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChatbotSettings } from "@shared/types";

export function SettingsPanel() {
  const { settingsOpen, setSettingsOpen, settings, updateSettings, setGraphRAGOpen } = useChatbot();
  
  // We need to have a stable pattern of hooks, so don't conditionally render here
  // Instead, return null from the function body
  const [formData, setFormData] = useState<ChatbotSettings>({
    name: settings.name,
    iconUrl: settings.iconUrl,
    language: settings.language,
    theme: settings.theme
  });
  
  // Update local state when settings change
  useEffect(() => {
    setFormData({
      name: settings.name,
      iconUrl: settings.iconUrl,
      language: settings.language,
      theme: settings.theme
    });
  }, [settings]);
  
  // Early return if settings panel is not visible
  if (!settingsOpen) {
    return null;
  }
  
  const handleClose = () => {
    setSettingsOpen(false);
  };
  
  const handleCancel = () => {
    setSettingsOpen(false);
  };
  
  const handleSave = () => {
    updateSettings(formData);
    setSettingsOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (field: keyof ChatbotSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleOpenGraphRAG = () => {
    setSettingsOpen(false);
    setGraphRAGOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-nestle-dark">Chatbot Settings</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClose}
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Chatbot Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Chatbot Name
          </label>
          <Input 
            type="text" 
            id="name" 
            value={formData.name} 
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nestle-blue"
          />
        </div>
        
        {/* Chatbot Icon */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chatbot Icon
          </label>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2" 
                 style={{borderColor: formData.theme === 'red' ? '#E2001A' : 
                                    formData.theme === 'blue' ? '#009FDA' : 
                                    formData.theme === 'green' ? '#009530' : 
                                    formData.theme === 'purple' ? '#7F3F98' :
                                    formData.theme === 'brown' ? '#8B4513' :
                                    formData.theme === 'orange' ? '#FF8C00' :
                                    formData.theme === 'pink' ? '#FF69B4' : '#E2001A'}}>
              {formData.customIconUrl ? (
                <img 
                  src={formData.customIconUrl} 
                  className="w-full h-full object-cover" 
                  alt="Custom chatbot icon" 
                  onError={(e) => {
                    e.currentTarget.src = NestleIcon;
                    setFormData(prev => ({ ...prev, customIconUrl: undefined }));
                  }}
                />
              ) : (
                <img 
                  src={NestleIcon} 
                  className="w-full h-full object-cover" 
                  alt="Default chatbot icon" 
                />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Upload or choose an icon</p>
              
              {/* Icon Upload */}
              <div>
                <label htmlFor="icon-upload" className="cursor-pointer px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium inline-block">
                  Upload Icon
                </label>
                <input 
                  id="icon-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          customIconUrl: event.target?.result as string
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              
              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`w-8 h-8 rounded-full bg-white border border-gray-300 overflow-hidden hover:border-blue-500 focus:outline-none focus:border-blue-500 ${!formData.customIconUrl ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, customIconUrl: undefined }))}
                >
                  <img src={NestleIcon} className="w-full h-full object-cover" alt="Nestlé Icon" />
                </button>
              </div>
              
              {/* Icon Color Options */}
              <div>
                <p className="text-xs text-gray-500 mt-2 mb-1">Icon Color</p>
                <div className="flex flex-wrap gap-2">
                  {/* Default (no tint) */}
                  <button 
                    className={`w-6 h-6 rounded-full border focus:outline-none ${
                      !formData.iconColor ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'
                    }`}
                    style={{background: "white"}}
                    onClick={() => handleSelectChange("iconColor", "")}
                    aria-label="Default icon color"
                    title="Default"
                  ></button>
                  
                  {/* Red tint */}
                  <button 
                    className={`w-6 h-6 rounded-full border focus:outline-none ${
                      formData.iconColor === '#E2001A' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'
                    }`}
                    style={{background: "#E2001A"}}
                    onClick={() => handleSelectChange("iconColor", "#E2001A")}
                    aria-label="Red icon tint"
                    title="Red"
                  ></button>
                  
                  {/* Blue tint */}
                  <button 
                    className={`w-6 h-6 rounded-full border focus:outline-none ${
                      formData.iconColor === '#009FDA' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'
                    }`}
                    style={{background: "#009FDA"}}
                    onClick={() => handleSelectChange("iconColor", "#009FDA")}
                    aria-label="Blue icon tint"
                    title="Blue"
                  ></button>
                  
                  {/* Green tint */}
                  <button 
                    className={`w-6 h-6 rounded-full border focus:outline-none ${
                      formData.iconColor === '#009530' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'
                    }`}
                    style={{background: "#009530"}}
                    onClick={() => handleSelectChange("iconColor", "#009530")}
                    aria-label="Green icon tint"
                    title="Green"
                  ></button>
                  
                  {/* Purple tint */}
                  <button 
                    className={`w-6 h-6 rounded-full border focus:outline-none ${
                      formData.iconColor === '#7F3F98' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'
                    }`}
                    style={{background: "#7F3F98"}}
                    onClick={() => handleSelectChange("iconColor", "#7F3F98")}
                    aria-label="Purple icon tint"
                    title="Purple"
                  ></button>
                  
                  {/* Gold tint */}
                  <button 
                    className={`w-6 h-6 rounded-full border focus:outline-none ${
                      formData.iconColor === '#FFD700' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'
                    }`}
                    style={{background: "#FFD700"}}
                    onClick={() => handleSelectChange("iconColor", "#FFD700")}
                    aria-label="Gold icon tint"
                    title="Gold"
                  ></button>
                  
                  {/* Silver tint */}
                  <button 
                    className={`w-6 h-6 rounded-full border focus:outline-none ${
                      formData.iconColor === '#C0C0C0' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'
                    }`}
                    style={{background: "#C0C0C0"}}
                    onClick={() => handleSelectChange("iconColor", "#C0C0C0")}
                    aria-label="Silver icon tint"
                    title="Silver"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Language */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <Select 
            value={formData.language} 
            onValueChange={(value) => handleSelectChange("language", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Theme */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`w-8 h-8 rounded-full bg-red-600 border-2 focus:outline-none ${
                formData.theme === "red" ? "border-blue-600 ring-2 ring-blue-600" : "border-white"
              }`}
              onClick={() => handleSelectChange("theme", "red")}
              aria-label="Red theme"
              title="Red"
            ></button>
            <button 
              className={`w-8 h-8 rounded-full bg-blue-500 border-2 focus:outline-none ${
                formData.theme === "blue" ? "border-blue-600 ring-2 ring-blue-600" : "border-white"
              }`}
              onClick={() => handleSelectChange("theme", "blue")}
              aria-label="Blue theme"
              title="Blue"
            ></button>
            <button 
              className={`w-8 h-8 rounded-full bg-green-600 border-2 focus:outline-none ${
                formData.theme === "green" ? "border-blue-600 ring-2 ring-blue-600" : "border-white"
              }`}
              onClick={() => handleSelectChange("theme", "green")}
              aria-label="Green theme"
              title="Green"
            ></button>
            <button 
              className={`w-8 h-8 rounded-full bg-purple-600 border-2 focus:outline-none ${
                formData.theme === "purple" ? "border-blue-600 ring-2 ring-blue-600" : "border-white"
              }`}
              onClick={() => handleSelectChange("theme", "purple")}
              aria-label="Purple theme"
              title="Purple"
            ></button>
            <button 
              className={`w-8 h-8 rounded-full border-2 focus:outline-none ${
                formData.theme === "orange" ? "border-blue-600 ring-2 ring-blue-600" : "border-white"
              }`}
              style={{backgroundColor: '#FF8C00'}}
              onClick={() => handleSelectChange("theme", "orange")}
              aria-label="Orange theme"
              title="Orange"
            ></button>
            <button 
              className={`w-8 h-8 rounded-full border-2 focus:outline-none ${
                formData.theme === "pink" ? "border-blue-600 ring-2 ring-blue-600" : "border-white"
              }`}
              style={{backgroundColor: '#FF69B4'}}
              onClick={() => handleSelectChange("theme", "pink")}
              aria-label="Pink theme"
              title="Pink"
            ></button>
            <button 
              className={`w-8 h-8 rounded-full border-2 focus:outline-none ${
                formData.theme === "brown" ? "border-blue-600 ring-2 ring-blue-600" : "border-white"
              }`}
              style={{backgroundColor: '#8B4513'}}
              onClick={() => handleSelectChange("theme", "brown")}
              aria-label="Brown theme"
              title="Brown"
            ></button>
            <button 
              className={`w-8 h-8 rounded-full border-2 focus:outline-none ${
                formData.theme === "gray" ? "border-blue-600 ring-2 ring-blue-600" : "border-white"
              }`}
              style={{backgroundColor: '#4B5563'}}
              onClick={() => handleSelectChange("theme", "gray")}
              aria-label="Gray theme"
              title="Gray"
            ></button>
          </div>
        </div>
        
        {/* Advanced Settings */}
        <div className="mb-6">
          <Button 
            variant="outline"
            onClick={handleOpenGraphRAG}
            className="w-full text-blue-600 border-blue-600"
          >
            Advanced: Knowledge Graph Editor
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}