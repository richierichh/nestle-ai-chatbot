import { useState, useEffect } from "react";
import { useChatbot } from "./ChatProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { getRequest, postRequest } from "@/lib/api";

// Graph RAG node types
const NODE_TYPES = ["product", "recipe", "ingredient", "category", "nutritional_info", "custom"];
const RELATIONSHIP_TYPES = ["USED_IN", "CONTAINS", "BELONGS_TO", "SIMILAR_TO", "RELATED_TO", "HAS_PROPERTY"];

export function GraphRAGPanel() {
  const { graphRAGOpen, setGraphRAGOpen } = useChatbot();
  
  // Form states - must be defined before any conditional returns
  const [nodeType, setNodeType] = useState("product");
  const [nodeName, setNodeName] = useState("");
  const [nodeProperties, setNodeProperties] = useState("");
  const [customNodeType, setCustomNodeType] = useState("");
  const [showCustomType, setShowCustomType] = useState(false);
  
  const [sourceNode, setSourceNode] = useState("");
  const [relationshipType, setRelationshipType] = useState("USED_IN");
  const [targetNode, setTargetNode] = useState("");
  const [customRelationType, setCustomRelationType] = useState("");
  const [showCustomRelation, setShowCustomRelation] = useState(false);
  
  // State for real nodes from API
  const [nodes, setNodes] = useState<Array<{id: string, name: string, type: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Fetch nodes when component mounts
  useEffect(() => {
    if (graphRAGOpen) {
      fetchNodes();
    }
  }, [graphRAGOpen]);
  
  // Handler for node type changes
  useEffect(() => {
    setShowCustomType(nodeType === "custom");
  }, [nodeType]);
  
  // Handler for relationship type changes
  useEffect(() => {
    setShowCustomRelation(relationshipType === "CUSTOM");
  }, [relationshipType]);

  // Early return if the panel is not open
  if (!graphRAGOpen) {
    return null;
  }
  
  // Fetch all nodes from the API
  const fetchNodes = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const fetchedNodes = await getRequest("/api/graph/nodes");
      setNodes(fetchedNodes || []);
    } catch (err) {
      console.error("Error fetching nodes:", err);
      setError("Failed to load knowledge graph nodes. Using sample data instead.");
      // Fallback to sample data if API fails
      setNodes([
        { id: "1", name: "Nestlé Toll House Morsels", type: "product" },
        { id: "2", name: "Chocolate Chip Cookies", type: "recipe" },
        { id: "3", name: "Baking", type: "category" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setGraphRAGOpen(false);
  };
  
  const handleAddNode = async () => {
    try {
      if (!nodeName.trim()) {
        alert("Please enter a node name");
        return;
      }
      
      // Handle custom node type
      const actualNodeType = nodeType === "custom" 
        ? (customNodeType.trim() || "custom") 
        : nodeType;
      
      let parsedProperties = {};
      if (nodeProperties.trim()) {
        try {
          parsedProperties = JSON.parse(nodeProperties);
        } catch (e) {
          alert("Invalid JSON in properties field. Please use a valid JSON format like: {\"key\": \"value\"}");
          return;
        }
      }
      
      setIsLoading(true);
      
      // Submit to API
      try {
        const newNode = await postRequest("/api/graph/nodes", {
          type: actualNodeType,
          name: nodeName,
          properties: parsedProperties
        });
        
        // Update nodes list with new node
        setNodes([...nodes, newNode]);
        
        // Clear form
        setNodeName("");
        setNodeProperties("");
        setCustomNodeType("");
        setNodeType("product"); // Reset to default
        
        alert("Node added successfully! Your knowledge has been added to the chatbot.");
      } catch (error) {
        console.error("Failed to add node:", error);
        alert("Failed to add node. Please check your inputs and try again.");
      } finally {
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error("Failed to process node addition:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };
  
  const handleAddRelationship = async () => {
    try {
      if (!sourceNode || !targetNode) {
        alert("Please select both source and target nodes");
        return;
      }
      
      if (sourceNode === targetNode) {
        alert("Source and target nodes must be different");
        return;
      }
      
      // Handle custom relationship type
      const actualRelationType = relationshipType === "CUSTOM" 
        ? (customRelationType.trim() || "RELATED_TO") 
        : relationshipType;
      
      setIsLoading(true);
      
      try {
        await postRequest("/api/graph/relationships", {
          sourceId: sourceNode,
          targetId: targetNode,
          type: actualRelationType,
          properties: {}
        });
        
        // Clear form
        setSourceNode("");
        setTargetNode("");
        setRelationshipType("USED_IN"); // Reset to default
        setCustomRelationType("");
        
        alert("Relationship added successfully! The chatbot will now use this connection to answer questions.");
      } catch (error) {
        console.error("Failed to add relationship:", error);
        alert("Failed to add relationship. Please try again.");
      } finally {
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error("Failed to process relationship addition:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-hidden">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] p-6 shadow-xl overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
          <h3 className="text-xl font-semibold text-gray-800">Knowledge Graph Editor</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClose}
            aria-label="Close editor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Enhance the chatbot's knowledge by adding new relationships between concepts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add New Knowledge Node */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Add New Knowledge Node</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Type
                </label>
                <Select value={nodeType} onValueChange={setNodeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select node type" />
                  </SelectTrigger>
                  <SelectContent>
                    {NODE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {showCustomType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Node Type
                  </label>
                  <Input
                    type="text"
                    value={customNodeType}
                    onChange={(e) => setCustomNodeType(e.target.value)}
                    placeholder="e.g., brand, flavor, packaging_type"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a descriptive type for your custom node
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Name
                </label>
                <Input 
                  type="text" 
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="e.g., Nestlé Toll House Morsels"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Properties
                </label>
                <Textarea 
                  value={nodeProperties}
                  onChange={(e) => setNodeProperties(e.target.value)}
                  placeholder='{"description": "Semi-sweet chocolate chips", "size": "340g"}'
                  className="h-24"
                />
              </div>
              
              <Button 
                className="w-full bg-red-600 text-white hover:bg-red-700"
                onClick={handleAddNode}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Node"}
              </Button>
            </div>
          </div>
          
          {/* Add New Relationship */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Add New Relationship</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Node
                </label>
                <Select value={sourceNode} onValueChange={setSourceNode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source node..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {nodes.map(node => (
                      <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship Type
                </label>
                <Select value={relationshipType} onValueChange={setRelationshipType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                    <SelectItem value="CUSTOM">CUSTOM (define your own)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {showCustomRelation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Relationship Type
                  </label>
                  <Input
                    type="text"
                    value={customRelationType}
                    onChange={(e) => setCustomRelationType(e.target.value)}
                    placeholder="e.g., TASTES_LIKE, PAIRS_WITH"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use ALL_CAPS for relationship types (convention)
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Node
                </label>
                <Select value={targetNode} onValueChange={setTargetNode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target node..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {nodes.map(node => (
                      <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleAddRelationship}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Relationship"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Graph Visualization */}
        <div className="mt-6 border rounded-lg p-4">
          <h4 className="font-medium mb-3">Knowledge Graph Visualization</h4>
          <div className="bg-gray-100 rounded-lg h-60 flex items-center justify-center">
            <p className="text-gray-500">Graph visualization would be displayed here</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleClose}
          >
            Save and Close
          </Button>
        </div>
      </div>
    </div>
  );
}