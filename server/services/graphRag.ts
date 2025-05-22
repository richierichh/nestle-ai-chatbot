// Advanced in-memory graph database implementation with Neo4j-like query capabilities
// For a production environment, this would connect to Neo4j or Azure Cosmos DB with Gremlin API

interface GraphNode {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  embeddings?: number[]; // Semantic embeddings for node information
}

interface GraphRelationship {
  id: string;
  type: string;
  sourceId: string;
  targetId: string;
  properties: Record<string, any>;
  weight?: number; // Relationship strength/relevance
}

// Knowledge Graph structure
interface KnowledgeGraph {
  nodes: Map<string, GraphNode>;
  relationships: Map<string, GraphRelationship>;
  // Indexes for faster lookups
  nodesByType: Map<string, Set<string>>;  // type -> set of node IDs
  nodesByName: Map<string, string>;  // lowercase name -> node ID
  relationshipsByType: Map<string, Set<string>>;  // type -> set of relationship IDs
  nodeRelationships: Map<string, Set<string>>;  // node ID -> set of relationship IDs
}

// Create our in-memory graph database
const graph: KnowledgeGraph = {
  nodes: new Map<string, GraphNode>(),
  relationships: new Map<string, GraphRelationship>(),
  nodesByType: new Map<string, Set<string>>(),
  nodesByName: new Map<string, string>(),
  relationshipsByType: new Map<string, Set<string>>(),
  nodeRelationships: new Map<string, Set<string>>()
};

import { OpenAI } from "openai";

// Create OpenAI client for generating embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Define relationship types
export const RELATIONSHIP_TYPES = {
  USED_IN: "USED_IN",
  CONTAINS: "CONTAINS",
  BELONGS_TO: "BELONGS_TO",
  SIMILAR_TO: "SIMILAR_TO",
  RELATED_TO: "RELATED_TO",
  MADE_BY: "MADE_BY",
  HAS_INGREDIENT: "HAS_INGREDIENT",
  PART_OF: "PART_OF",
  REFERENCES: "REFERENCES"
};

// Define node types
export const NODE_TYPES = {
  PRODUCT: "product",
  RECIPE: "recipe",
  INGREDIENT: "ingredient",
  CATEGORY: "category",
  BRAND: "brand",
  PAGE: "page"
};

// Initialize with some sample data
function initializeGraph() {
  if (graph.nodes.size === 0) {
    // Add some initial nodes
    const initialNodes = [
      {
        id: "1",
        type: NODE_TYPES.PRODUCT,
        name: "Nestlé Toll House Morsels",
        properties: {
          description: "Semi-sweet chocolate chips",
          size: "340g"
        }
      },
      {
        id: "2",
        type: NODE_TYPES.RECIPE,
        name: "Chocolate Chip Cookies",
        properties: {
          difficulty: "Easy",
          prepTime: "15 minutes",
          cookTime: "12 minutes"
        }
      },
      {
        id: "3",
        type: NODE_TYPES.CATEGORY,
        name: "Baking",
        properties: {
          description: "Baking products and recipes"
        }
      },
      {
        id: "4",
        type: NODE_TYPES.INGREDIENT,
        name: "Chocolate",
        properties: {
          description: "Key baking ingredient"
        }
      },
      {
        id: "5",
        type: NODE_TYPES.BRAND,
        name: "Nestlé",
        properties: {
          description: "Global food brand"
        }
      }
    ];

    // Add nodes to graph
    initialNodes.forEach(node => {
      addNodeToGraph(node);
    });

    // Add some initial relationships
    const initialRelationships = [
      {
        id: "r1",
        type: RELATIONSHIP_TYPES.USED_IN,
        sourceId: "1",
        targetId: "2",
        properties: {}
      },
      {
        id: "r2",
        type: RELATIONSHIP_TYPES.BELONGS_TO,
        sourceId: "1",
        targetId: "3",
        properties: {}
      },
      {
        id: "r3",
        type: RELATIONSHIP_TYPES.BELONGS_TO,
        sourceId: "2",
        targetId: "3",
        properties: {}
      },
      {
        id: "r4",
        type: RELATIONSHIP_TYPES.CONTAINS,
        sourceId: "1",
        targetId: "4",
        properties: {}
      },
      {
        id: "r5",
        type: RELATIONSHIP_TYPES.MADE_BY,
        sourceId: "1",
        targetId: "5",
        properties: {}
      }
    ];

    // Add relationships to graph
    initialRelationships.forEach(rel => {
      addRelationshipToGraph(rel);
    });
  }
}

// Initialize the graph
initializeGraph();

// Helper function to add a node to the graph
function addNodeToGraph(node: GraphNode): void {
  // Add node to main node map
  graph.nodes.set(node.id, node);
  
  // Add to type index
  if (!graph.nodesByType.has(node.type)) {
    graph.nodesByType.set(node.type, new Set<string>());
  }
  graph.nodesByType.get(node.type)?.add(node.id);
  
  // Add to name index (lowercase for case-insensitive lookups)
  graph.nodesByName.set(node.name.toLowerCase(), node.id);
  
  // Initialize node relationships set
  if (!graph.nodeRelationships.has(node.id)) {
    graph.nodeRelationships.set(node.id, new Set<string>());
  }
}

// Helper function to add a relationship to the graph
function addRelationshipToGraph(relationship: GraphRelationship): void {
  // Add relationship to main relationship map
  graph.relationships.set(relationship.id, relationship);
  
  // Add to type index
  if (!graph.relationshipsByType.has(relationship.type)) {
    graph.relationshipsByType.set(relationship.type, new Set<string>());
  }
  graph.relationshipsByType.get(relationship.type)?.add(relationship.id);
  
  // Add to node relationships index for both source and target
  if (!graph.nodeRelationships.has(relationship.sourceId)) {
    graph.nodeRelationships.set(relationship.sourceId, new Set<string>());
  }
  graph.nodeRelationships.get(relationship.sourceId)?.add(relationship.id);
  
  if (!graph.nodeRelationships.has(relationship.targetId)) {
    graph.nodeRelationships.set(relationship.targetId, new Set<string>());
  }
  graph.nodeRelationships.get(relationship.targetId)?.add(relationship.id);
}

/**
 * Get embedding for a graph node to enable semantic search
 */
async function getNodeEmbedding(node: GraphNode): Promise<number[]> {
  try {
    // Create a text representation of the node
    const nodeText = `
      Type: ${node.type}
      Name: ${node.name}
      ${Object.entries(node.properties).map(([key, value]) => `${key}: ${value}`).join('\n')}
    `;
    
    // Use OpenAI to get the embedding
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: nodeText,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Failed to get node embedding:", error);
    
    // Fallback to simple embedding simulation
    const seed = node.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const vector = Array(1536).fill(0).map((_, i) => {
      const value = Math.sin(seed * (i + 1)) * 10000;
      return value - Math.floor(value);
    });
    
    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }
}

/**
 * Bulk import entity relations from scraping
 */
export async function importEntityRelations(relations: Array<{source: string; relation: string; target: string}>): Promise<number> {
  let addedCount = 0;
  
  for (const relation of relations) {
    try {
      // Check if source exists
      let sourceId = getNodeIdByName(relation.source);
      if (!sourceId) {
        // Create source node with appropriate type
        const sourceNode = await addNode(guessNodeType(relation.source, relation.relation), relation.source);
        sourceId = sourceNode.id;
        addedCount++;
      }
      
      // Check if target exists
      let targetId = getNodeIdByName(relation.target);
      if (!targetId) {
        // Create target node with appropriate type
        const targetNode = await addNode(guessNodeType(relation.target, relation.relation, false), relation.target);
        targetId = targetNode.id;
        addedCount++;
      }
      
      // Create relationship
      await addRelationship(sourceId, targetId, relation.relation);
      addedCount++;
    } catch (error) {
      console.error(`Failed to import relation ${relation.source} -[${relation.relation}]-> ${relation.target}:`, error);
    }
  }
  
  return addedCount;
}

/**
 * Guess the node type based on relation and name
 */
function guessNodeType(name: string, relation: string, isSource: boolean = true): string {
  const nameLower = name.toLowerCase();
  
  // Try to infer type from relation
  if (relation === RELATIONSHIP_TYPES.MADE_BY && !isSource) {
    return NODE_TYPES.BRAND;
  }
  if (relation === RELATIONSHIP_TYPES.CONTAINS && !isSource) {
    return NODE_TYPES.INGREDIENT;
  }
  if (relation === RELATIONSHIP_TYPES.BELONGS_TO && !isSource) {
    return NODE_TYPES.CATEGORY;
  }
  if (relation === RELATIONSHIP_TYPES.USED_IN && isSource) {
    return NODE_TYPES.INGREDIENT;
  }
  
  // Try to infer from name
  if (nameLower.includes("recipe") || nameLower.includes("cookie") || 
      nameLower.includes("cake") || nameLower.includes("dish")) {
    return NODE_TYPES.RECIPE;
  }
  if (nameLower.includes("nestlé") || nameLower.includes("nestle")) {
    return NODE_TYPES.BRAND;
  }
  
  // Default to page
  return NODE_TYPES.PAGE;
}

/**
 * Look up a node ID by name (case-insensitive)
 */
function getNodeIdByName(name: string): string | undefined {
  return graph.nodesByName.get(name.toLowerCase());
}

/**
 * Add a new node to the graph
 */
export async function addNode(
  type: string,
  name: string,
  properties: Record<string, any> = {}
): Promise<GraphNode> {
  // Generate a unique ID
  const id = `n${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
  
  const newNode: GraphNode = {
    id,
    type,
    name,
    properties
  };
  
  // Add embeddings if OpenAI key is available
  if (process.env.OPENAI_API_KEY) {
    try {
      newNode.embeddings = await getNodeEmbedding(newNode);
    } catch (error) {
      console.warn("Failed to add embeddings to node:", error);
    }
  }
  
  // Add to graph
  addNodeToGraph(newNode);
  
  console.log(`Added node: ${type} - ${name}`);
  return newNode;
}

/**
 * Add a new relationship to the graph
 */
export async function addRelationship(
  sourceId: string,
  targetId: string,
  type: string,
  properties: Record<string, any> = {}
): Promise<GraphRelationship> {
  // Check if nodes exist
  if (!graph.nodes.has(sourceId)) {
    throw new Error(`Source node with ID ${sourceId} not found`);
  }
  
  if (!graph.nodes.has(targetId)) {
    throw new Error(`Target node with ID ${targetId} not found`);
  }
  
  // Generate a unique ID
  const id = `r${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
  
  const newRelationship: GraphRelationship = {
    id,
    type,
    sourceId,
    targetId,
    properties,
    weight: 1.0 // Default weight
  };
  
  // Add to graph
  addRelationshipToGraph(newRelationship);
  
  const sourceNode = graph.nodes.get(sourceId);
  const targetNode = graph.nodes.get(targetId);
  
  console.log(`Added relationship: ${sourceNode?.name} -[${type}]-> ${targetNode?.name}`);
  return newRelationship;
}

/**
 * Get all nodes
 */
export async function getNodes(): Promise<GraphNode[]> {
  return Array.from(graph.nodes.values());
}

/**
 * Get nodes by type
 */
export async function getNodesByType(type: string): Promise<GraphNode[]> {
  const nodeIds = graph.nodesByType.get(type);
  if (!nodeIds) return [];
  
  return Array.from(nodeIds).map(id => graph.nodes.get(id)).filter(Boolean) as GraphNode[];
}

/**
 * Get all relationships
 */
export async function getRelationships(): Promise<GraphRelationship[]> {
  return Array.from(graph.relationships.values());
}

/**
 * Get relationships for a node
 */
export async function getNodeRelationships(nodeId: string): Promise<GraphRelationship[]> {
  const relationshipIds = graph.nodeRelationships.get(nodeId);
  if (!relationshipIds) return [];
  
  return Array.from(relationshipIds)
    .map(id => graph.relationships.get(id))
    .filter(Boolean) as GraphRelationship[];
}

/**
 * Find nodes by name pattern (case-insensitive)
 */
export async function findNodesByName(namePattern: string): Promise<GraphNode[]> {
  const pattern = namePattern.toLowerCase();
  
  return Array.from(graph.nodes.values())
    .filter(node => node.name.toLowerCase().includes(pattern));
}

/**
 * Perform a semantic search for nodes
 */
export async function semanticNodeSearch(query: string, limit: number = 5): Promise<GraphNode[]> {
  try {
    // Get all nodes with embeddings
    const nodesWithEmbeddings = Array.from(graph.nodes.values())
      .filter(node => node.embeddings && node.embeddings.length > 0);
    
    if (nodesWithEmbeddings.length === 0) {
      // Fallback to simple text search if no embeddings
      return findNodesByName(query);
    }
    
    // Get embedding for the query
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });
    
    const queryEmbedding = response.data[0].embedding;
    
    // Calculate similarity scores
    const scoredNodes = nodesWithEmbeddings.map(node => ({
      node,
      score: calculateCosineSimilarity(queryEmbedding, node.embeddings as number[])
    }));
    
    // Sort by similarity score and return top matches
    scoredNodes.sort((a, b) => b.score - a.score);
    return scoredNodes.slice(0, limit).map(item => item.node);
  } catch (error) {
    console.error("Error in semantic search:", error);
    // Fallback to text search
    return findNodesByName(query);
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
  }
  
  return dotProduct;
}

/**
 * Perform a graph query to find connected information
 * This uses a breadth-first traversal with depth limiting
 */
export async function queryGraph(
  startNodeId: string,
  maxDepth: number = 2,
  relationshipTypes: string[] = []
): Promise<{nodes: GraphNode[], relationships: GraphRelationship[]}> {
  const resultNodes = new Map<string, GraphNode>();
  const resultRelationships = new Map<string, GraphRelationship>();
  
  // Track visited nodes to prevent cycles
  const visitedNodeIds = new Set<string>();
  
  // Queue for breadth-first traversal
  const queue: Array<{nodeId: string, depth: number}> = [{nodeId: startNodeId, depth: 0}];
  
  while (queue.length > 0) {
    const {nodeId, depth} = queue.shift()!;
    
    // Skip if already visited or exceeds max depth
    if (visitedNodeIds.has(nodeId) || depth > maxDepth) {
      continue;
    }
    
    visitedNodeIds.add(nodeId);
    
    // Add node to results
    const node = graph.nodes.get(nodeId);
    if (node) {
      resultNodes.set(nodeId, node);
    } else {
      continue; // Skip if node doesn't exist
    }
    
    // Get relationships for this node
    const relationshipIds = graph.nodeRelationships.get(nodeId) || new Set<string>();
    
    // Process each relationship
    for (const relId of relationshipIds) {
      const relationship = graph.relationships.get(relId);
      if (!relationship) continue;
      
      // Filter by relationship type if specified
      if (relationshipTypes.length > 0 && !relationshipTypes.includes(relationship.type)) {
        continue;
      }
      
      // Add relationship to results
      resultRelationships.set(relId, relationship);
      
      // Get the connected node ID
      const connectedNodeId = relationship.sourceId === nodeId ? relationship.targetId : relationship.sourceId;
      
      // Add connected node to queue if not visited
      if (!visitedNodeIds.has(connectedNodeId)) {
        queue.push({nodeId: connectedNodeId, depth: depth + 1});
      }
    }
  }
  
  return {
    nodes: Array.from(resultNodes.values()),
    relationships: Array.from(resultRelationships.values())
  };
}

/**
 * Find paths between two nodes
 */
export async function findPaths(
  sourceId: string,
  targetId: string,
  maxDepth: number = 3
): Promise<Array<{nodes: GraphNode[], relationships: GraphRelationship[]}>> {
  const paths: Array<{nodes: GraphNode[], relationships: GraphRelationship[]}> = [];
  
  // Check if nodes exist
  if (!graph.nodes.has(sourceId) || !graph.nodes.has(targetId)) {
    return paths;
  }
  
  // Special case: source is target
  if (sourceId === targetId) {
    const node = graph.nodes.get(sourceId);
    if (node) {
      paths.push({
        nodes: [node],
        relationships: []
      });
    }
    return paths;
  }
  
  // Queue for BFS: [nodeId, path of node IDs, path of relationship IDs]
  const queue: Array<[string, string[], string[]]> = [[sourceId, [sourceId], []]];
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const [currentNodeId, nodePath, relPath] = queue.shift()!;
    
    // Skip if exceeds max depth
    if (nodePath.length > maxDepth + 1) {
      continue;
    }
    
    // Skip if already visited
    if (visited.has(currentNodeId)) {
      continue;
    }
    
    visited.add(currentNodeId);
    
    // Check if we've reached the target
    if (currentNodeId === targetId) {
      // Convert paths of IDs to actual objects
      const nodeObjects = nodePath.map(id => graph.nodes.get(id)).filter(Boolean) as GraphNode[];
      const relationshipObjects = relPath.map(id => graph.relationships.get(id)).filter(Boolean) as GraphRelationship[];
      
      paths.push({
        nodes: nodeObjects,
        relationships: relationshipObjects
      });
      
      // Continue searching for other paths
      continue;
    }
    
    // Get relationships for this node
    const relationshipIds = graph.nodeRelationships.get(currentNodeId) || new Set<string>();
    
    // Explore each relationship
    for (const relId of relationshipIds) {
      const relationship = graph.relationships.get(relId);
      if (!relationship) continue;
      
      // Get the connected node ID
      const connectedNodeId = relationship.sourceId === currentNodeId ? relationship.targetId : relationship.sourceId;
      
      // Skip if already in path (avoid cycles)
      if (nodePath.includes(connectedNodeId)) {
        continue;
      }
      
      // Add to queue with updated paths
      queue.push([
        connectedNodeId,
        [...nodePath, connectedNodeId],
        [...relPath, relId]
      ]);
    }
  }
  
  return paths;
}

/**
 * Extract a knowledge subgraph based on a query
 * Used to provide context for RAG responses
 */
export async function extractKnowledgeSubgraph(query: string): Promise<{
  nodes: GraphNode[],
  relationships: GraphRelationship[],
  centralNode?: GraphNode
}> {
  try {
    // First, find relevant nodes through semantic search
    const relevantNodes = await semanticNodeSearch(query, 3);
    
    if (relevantNodes.length === 0) {
      return { nodes: [], relationships: [] };
    }
    
    // Use the most relevant node as central node
    const centralNode = relevantNodes[0];
    
    // Extract subgraph around each relevant node
    const subgraphs = await Promise.all(
      relevantNodes.map(node => queryGraph(node.id, 2))
    );
    
    // Combine all subgraphs
    const allNodes = new Map<string, GraphNode>();
    const allRelationships = new Map<string, GraphRelationship>();
    
    for (const subgraph of subgraphs) {
      for (const node of subgraph.nodes) {
        allNodes.set(node.id, node);
      }
      for (const rel of subgraph.relationships) {
        allRelationships.set(rel.id, rel);
      }
    }
    
    return {
      nodes: Array.from(allNodes.values()),
      relationships: Array.from(allRelationships.values()),
      centralNode
    };
  } catch (error) {
    console.error("Error extracting knowledge subgraph:", error);
    return { nodes: [], relationships: [] };
  }
}

/**
 * Get graph statistics
 */
export async function getGraphStats(): Promise<{
  nodeCount: number;
  relationshipCount: number;
  nodeTypes: Record<string, number>;
  relationshipTypes: Record<string, number>;
}> {
  const nodeTypes: Record<string, number> = {};
  const relationshipTypes: Record<string, number> = {};
  
  // Count node types
  for (const [type, nodeIds] of graph.nodesByType.entries()) {
    nodeTypes[type] = nodeIds.size;
  }
  
  // Count relationship types
  for (const [type, relIds] of graph.relationshipsByType.entries()) {
    relationshipTypes[type] = relIds.size;
  }
  
  return {
    nodeCount: graph.nodes.size,
    relationshipCount: graph.relationships.size,
    nodeTypes,
    relationshipTypes
  };
}
