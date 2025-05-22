// Enhanced vector database implementation that can work with Azure Cognitive Search
// For development and testing, we'll use a sophisticated in-memory implementation
// that mimics Azure Cognitive Search capabilities

import { OpenAI } from "openai";

// Create OpenAI client for generating embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

interface VectorDocument {
  id: string;
  url: string;
  title: string;
  content: string;
  vector: number[];
  metadata: {
    category?: string;
    tags?: string[];
    pageType?: string;
    lastUpdated?: string;
    imageCount?: number;
    productInfo?: {
      name?: string;
      brand?: string;
      ingredients?: string[];
    };
    recipeInfo?: {
      prepTime?: string;
      cookTime?: string;
      servings?: string;
      difficulty?: string;
      nutrients?: Record<string, string>;
    };
  };
}

interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  links: string[];
  images: string[];
  tables: string[][];
  metadata: {
    category?: string;
    tags?: string[];
    datePublished?: string;
    description?: string;
    productInfo?: {
      name?: string;
      brand?: string;
      ingredients?: string[];
    };
    recipeInfo?: {
      prepTime?: string;
      cookTime?: string;
      servings?: string;
      difficulty?: string;
      nutrients?: Record<string, string>;
    };
  };
  entityRelations: Array<{
    source: string;
    relation: string;
    target: string;
  }>;
}

// In-memory vector database for development/testing
let vectorDocuments: VectorDocument[] = [];

/**
 * Determine the page type based on content and metadata
 */
function determinePageType(page: ScrapedPage): string {
  if (page.metadata.productInfo?.name) {
    return "product";
  } else if (page.metadata.recipeInfo) {
    return "recipe";
  } else if (page.title.toLowerCase().includes("about") || 
             page.content.toLowerCase().includes("about us") ||
             page.content.toLowerCase().includes("our story")) {
    return "about";
  } else if (page.title.toLowerCase().includes("contact") || 
             page.content.toLowerCase().includes("contact us")) {
    return "contact";
  } else if (page.url.includes("/category/") || 
             page.url.includes("/categories/") ||
             page.metadata.category) {
    return "category";
  } else {
    return "general";
  }
}

/**
 * Get OpenAI embedding for text
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Use actual OpenAI embeddings for better semantic search
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.slice(0, 8000),  // OpenAI has a token limit
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting OpenAI embedding:", error);
    // Fall back to simulated embedding if OpenAI API fails
    return generateSimulatedEmbedding(text);
  }
}

/**
 * Add scraped content to the vector database
 */
export async function addToVectorDb(scrapedPages: ScrapedPage[]): Promise<void> {
  console.log(`Adding ${scrapedPages.length} pages to vector database`);
  
  for (const page of scrapedPages) {
    try {
      // Check if the URL already exists in the database
      const existingIndex = vectorDocuments.findIndex(doc => doc.url === page.url);
      
      // Extract key content for embedding (title + content + metadata)
      const contentForEmbedding = `
        Title: ${page.title}
        Description: ${page.metadata.description || ''}
        Category: ${page.metadata.category || ''}
        Content: ${page.content.slice(0, 8000)}
      `;
      
      // Generate embedding vector using OpenAI API
      const vector = await getEmbedding(contentForEmbedding);
      
      // Prepare document for storage
      const document: VectorDocument = {
        id: generateId(page.url),
        url: page.url,
        title: page.title,
        content: page.content,
        vector,
        metadata: {
          category: page.metadata.category,
          tags: page.metadata.tags,
          pageType: determinePageType(page),
          lastUpdated: new Date().toISOString(),
          imageCount: page.images.length,
          productInfo: page.metadata.productInfo,
          recipeInfo: page.metadata.recipeInfo,
        }
      };
      
      if (existingIndex >= 0) {
        // Update existing document
        vectorDocuments[existingIndex] = document;
        console.log(`Updated document: ${page.title}`);
      } else {
        // Add new document
        vectorDocuments.push(document);
        console.log(`Added new document: ${page.title}`);
      }
    } catch (error) {
      console.error(`Error adding ${page.url} to vector database:`, error);
    }
  }
  
  console.log(`Vector database now contains ${vectorDocuments.length} documents`);
}

/**
 * Search the vector database for relevant content
 */
export async function searchVectorDb(query: string): Promise<Array<{ url: string; title: string; content: string }>> {
  console.log(`Searching vector database for: ${query}`);
  
  if (vectorDocuments.length === 0) {
    console.log("Vector database is empty, returning empty results");
    return [];
  }
  
  try {
    // Generate query embedding using OpenAI API
    const queryVector = await getEmbedding(query);
    
    // Calculate similarity scores
    const scored = vectorDocuments.map(doc => ({
      document: doc,
      score: calculateCosineSimilarity(queryVector, doc.vector)
    }));
    
    // Sort by similarity score
    scored.sort((a, b) => b.score - a.score);
    
    // Return top results
    const topResults = scored.slice(0, 5).map(item => ({
      url: item.document.url,
      title: item.document.title,
      content: item.document.content.slice(0, 1000) + (item.document.content.length > 1000 ? '...' : '')
    }));
    
    console.log(`Found ${topResults.length} relevant results for query: ${query}`);
    return topResults;
  } catch (error) {
    console.error("Error searching vector database:", error);
    return [];
  }
}

/**
 * Perform a filtered search by metadata
 */
export async function searchByMetadata(
  filters: {
    category?: string;
    pageType?: string;
    productName?: string;
    brand?: string;
    tags?: string[];
  }
): Promise<Array<{ url: string; title: string; content: string }>> {
  console.log(`Searching with filters:`, filters);
  
  let filteredDocs = vectorDocuments;
  
  // Apply filters
  if (filters.category) {
    filteredDocs = filteredDocs.filter(doc => doc.metadata.category === filters.category);
  }
  
  if (filters.pageType) {
    filteredDocs = filteredDocs.filter(doc => doc.metadata.pageType === filters.pageType);
  }
  
  if (filters.productName) {
    filteredDocs = filteredDocs.filter(doc => 
      doc.metadata.productInfo?.name?.toLowerCase().includes(filters.productName?.toLowerCase() || '')
    );
  }
  
  if (filters.brand) {
    filteredDocs = filteredDocs.filter(doc => 
      doc.metadata.productInfo?.brand?.toLowerCase().includes(filters.brand?.toLowerCase() || '')
    );
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filteredDocs = filteredDocs.filter(doc => 
      doc.metadata.tags?.some(tag => 
        filters.tags?.includes(tag)
      )
    );
  }
  
  // Map to return format
  const results = filteredDocs.map(doc => ({
    url: doc.url,
    title: doc.title,
    content: doc.content.slice(0, 1000) + (doc.content.length > 1000 ? '...' : '')
  }));
  
  console.log(`Found ${results.length} results matching filters`);
  return results;
}

// Helper functions

/**
 * Generate a simulated embedding vector
 * This is a fallback if OpenAI API is not available
 */
function generateSimulatedEmbedding(text: string): number[] {
  // Create a deterministic vector based on text content
  // This makes the search somewhat content-aware even in simulation mode
  const seed = hashStringToNumber(text);
  const vector = Array(1536).fill(0).map((_, i) => {
    // Use a simple pseudorandom number generator with the seed
    const value = Math.sin(seed * (i + 1)) * 10000;
    return value - Math.floor(value);
  });
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

/**
 * Simple string hash function for generating deterministic embeddings
 */
function hashStringToNumber(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < Math.min(str.length, 1000); i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash;
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
  
  // Vectors are already normalized, so cosine similarity is just the dot product
  return dotProduct;
}

/**
 * Generate an ID from a URL
 */
function generateId(url: string): string {
  return Buffer.from(url).toString("base64").replace(/[+/=]/g, "");
}
