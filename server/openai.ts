import OpenAI from "openai";
import { extractKnowledgeSubgraph } from "./services/graphRag";
import { searchByMetadata } from "./services/vectorDb";
import { getNutritionalInfo } from "./data/nutritionalInfo";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

interface ScrapedContent {
  url: string;
  title: string;
  content: string;
}

interface ChatResponse {
  text: string;
  references?: Array<{ url: string; title: string }>;
}

/**
 * Process a message using OpenAI with context from vector search results and GraphRAG
 */
export async function processMessage(
  message: string,
  vectorResults: ScrapedContent[]
): Promise<ChatResponse> {
  try {
    // Get additional context from knowledge graph
    const graphContext = await getGraphContext(message);
    
    // Prepare context from vector search results
    const vectorContext = vectorResults
      .map((item) => `Title: ${item.title}\nURL: ${item.url}\nContent: ${item.content}`)
      .join("\n\n");

    // Combine contexts
    const combinedContext = `
VECTOR DATABASE RESULTS:
${vectorContext || "No specific information found in vector database."}

KNOWLEDGE GRAPH CONTEXT:
${graphContext || "No specific information found in knowledge graph."}
`;

    // Detect query intent to provide more relevant information
    const queryIntent = await detectQueryIntent(message);
    
    // If the intent is for a specific product or recipe, add filtered results
    let specializedContext = "";
    
    // Check for nutritional information in our database if it's a product query
    if (queryIntent.entityType === 'product' && queryIntent.entityName) {
      const nutritionalInfo = getNutritionalInfo(queryIntent.entityName);
      
      if (nutritionalInfo) {
        specializedContext += `
NUTRITIONAL INFORMATION FOR "${queryIntent.entityName.toUpperCase()}":
`;
        nutritionalInfo.forEach((info, index) => {
          specializedContext += `
Product Variant ${index + 1}: ${info.name}
Serving Size: ${info.servingSize}
Calories: ${info.calories} per serving
`;
          if (info.protein) specializedContext += `Protein: ${info.protein}g\n`;
          if (info.carbohydrates) specializedContext += `Carbohydrates: ${info.carbohydrates}g\n`;
          if (info.sugars) specializedContext += `Sugars: ${info.sugars}g\n`;
          if (info.fat) specializedContext += `Total Fat: ${info.fat.total}g\n`;
          if (info.fat?.saturated) specializedContext += `Saturated Fat: ${info.fat.saturated}g\n`;
          
          // Add variants if available
          if (info.variants && info.variants.length > 0) {
            specializedContext += `\nSub-variants within ${info.name}:\n`;
            info.variants.forEach(variant => {
              specializedContext += `- ${variant.name}: ${variant.servingSize}, ${variant.calories} calories\n`;
            });
          }
        });
      }
    }
    
    // Also get filtered results from vector database
    if (queryIntent.entityType) {
      try {
        const filteredResults = await searchByMetadata({
          pageType: queryIntent.entityType,
          productName: queryIntent.entityName
        });
        
        if (filteredResults.length > 0) {
          specializedContext += `
SPECIALIZED RESULTS FOR ${queryIntent.entityType.toUpperCase()} "${queryIntent.entityName}":
${filteredResults.map(r => `Title: ${r.title}\nURL: ${r.url}\nExcerpt: ${r.content.substring(0, 200)}...`).join("\n\n")}
`;
        }
      } catch (error) {
        console.error("Error getting specialized context:", error);
      }
    }

    // Enhanced system prompt with GraphRAG capabilities
    const systemPrompt = `
You are Smartie, the personal MadeWithNestlé assistant. Your name is Smartie, not Nestlé Assistant.
Your goal is to provide accurate, detailed information about Nestlé products, recipes, and related topics.

Follow these guidelines:
1. Be friendly, helpful, and concise.
2. When referencing information, use numbered references like [1], [2], etc.
3. ALWAYS include precise nutritional information when asked about products (calories, protein, etc.)
4. Format nutrition info with bullet points using hyphens (-) only, not asterisks (*).
5. Focus on Nestlé products and recipes.
6. For product questions, always provide specific details like:
   - Exact calorie counts (e.g., "230 calories per bar")
   - Nutritional content (protein, fat, etc.)
   - Ingredients when available
   - Product variants and their differences
7. For gift or recipe questions, format as numbered lists with clear options.
8. Include "Buy in Store" links when relevant.
9. Always list "References:" at the end with numbered sources.
10. When asked about calories or nutrition, always provide specific numbers, not general statements.
11. DO NOT use markdown formatting like # or * or ** in your responses. Use plain text only.
12. For recipe steps, use numbers (1., 2., 3.) without hashtags. For headings use all caps instead of hashtags.

Example formatting for calorie questions:
The calorie content of a KitKat bar varies depending on the specific type:

1. KITKAT 4-Finger Wafer Bar, Milk Chocolate (45 g):
   - Calories: 230 per bar [1]

2. KITKAT Valentine's Mini Chocolate Wafer Bars Pack of 30 (per 3 bars, 36 g):
   - Calories: 180 per 3 bars [2]

Example recipe format:
CHOCOLATE CHIP COOKIES

Ingredients:
- 2 1/4 cups all-purpose flour
- 1 teaspoon baking soda
- 1 teaspoon salt
- 1 cup butter, softened
- 3/4 cup granulated sugar
- 3/4 cup packed brown sugar
- 1 teaspoon vanilla extract
- 2 large eggs
- 2 cups NESTLE TOLL HOUSE Semi-Sweet Chocolate Morsels

Instructions:
1. Preheat oven to 375° F.
2. Combine flour, baking soda and salt in small bowl.
3. Beat butter, granulated sugar, brown sugar and vanilla extract in large mixer bowl until creamy.

When responding, format the message as shown in the examples, with clear structure and numbered references, but no markdown formatting.
`;

    // Prepare prompt with combined context
    const userPromptWithContext = `
User Query: ${message}

Relevant Information:
${combinedContext}
${specializedContext}
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptWithContext },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const responseText = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    // Extract references from the response
    const references = extractReferences(responseText, vectorResults);

    // Return formatted response
    return {
      text: cleanResponseText(responseText),
      references,
    };
  } catch (error) {
    console.error("Error processing message with OpenAI:", error);
    throw new Error("Failed to process message");
  }
}

/**
 * Detect query intent to help provide more relevant information
 */
async function detectQueryIntent(query: string): Promise<{
  entityType?: string;
  entityName?: string;
  action?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an intent classifier for a Nestlé chatbot. 
          Analyze the query and extract:
          - entityType: What type of thing is the user asking about? (product, recipe, ingredient, category, brand)
          - entityName: The specific name of the entity they're asking about, if any
          - action: What they want to do or know (find, learn about, get details, etc.)
          
          Return only a JSON object with these fields. If a field is not applicable, exclude it.`
        },
        { role: "user", content: query }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const intentData = JSON.parse(response.choices[0].message.content || "{}");
    return intentData;
  } catch (error) {
    console.error("Error detecting query intent:", error);
    return {};
  }
}

/**
 * Get context from knowledge graph
 */
async function getGraphContext(query: string): Promise<string> {
  try {
    const { nodes, relationships, centralNode } = await extractKnowledgeSubgraph(query);
    
    if (nodes.length === 0) {
      return "No relevant knowledge graph information found.";
    }
    
    // Format nodes information
    const nodesInfo = nodes.map(node => 
      `${node.type.toUpperCase()}: ${node.name}${
        Object.keys(node.properties).length > 0 
          ? `\nProperties: ${Object.entries(node.properties)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}`
          : ''
      }`
    ).join('\n\n');
    
    // Format relationships
    const relationshipsInfo = relationships.map(rel => {
      const source = nodes.find(n => n.id === rel.sourceId);
      const target = nodes.find(n => n.id === rel.targetId);
      
      if (!source || !target) return '';
      
      return `${source.name} -[${rel.type}]-> ${target.name}`;
    }).filter(Boolean).join('\n');
    
    return `
NODES:
${nodesInfo}

RELATIONSHIPS:
${relationshipsInfo}

${centralNode ? `CENTRAL CONCEPT: ${centralNode.name} (${centralNode.type})` : ''}
`;
  } catch (error) {
    console.error("Error getting graph context:", error);
    return "Error retrieving knowledge graph information.";
  }
}

/**
 * Extract references from the response text and vector results
 */
function extractReferences(
  responseText: string,
  vectorResults: ScrapedContent[]
): Array<{ url: string; title: string }> {
  const references: Array<{ url: string; title: string }> = [];
  
  // Check if any vector result URLs are mentioned in the response
  for (const result of vectorResults) {
    if (responseText.includes(result.url)) {
      references.push({
        url: result.url,
        title: result.title,
      });
    }
  }
  
  // If no explicit references were found but we have vector results,
  // include the most relevant ones (up to 3)
  if (references.length === 0 && vectorResults.length > 0) {
    for (let i = 0; i < Math.min(vectorResults.length, 3); i++) {
      references.push({
        url: vectorResults[i].url,
        title: vectorResults[i].title,
      });
    }
  }
  
  return references;
}

/**
 * Clean response text by removing reference markers
 */
function cleanResponseText(text: string): string {
  // Remove reference sections like [1], [2], etc.
  return text.replace(/\[\d+\]/g, "").trim();
}
