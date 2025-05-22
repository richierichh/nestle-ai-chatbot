import axios from "axios";
import * as cheerio from "cheerio";

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
  // Used for creating relationships in the graph database
  entityRelations: Array<{
    source: string;
    relation: string;
    target: string;
  }>;
}

/**
 * Scrape content from Made with Nestlé website
 */
export async function scrapeMadeWithNestle(startUrl: string): Promise<ScrapedPage[]> {
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const results: ScrapedPage[] = [];
  
  // Limit to prevent excessive scraping
  const MAX_PAGES = 100;
  
  // Check if the startUrl is valid
  if (!startUrl.includes("madewithnestle.ca") && !startUrl.startsWith("https://www.madewithnestle.ca")) {
    startUrl = "https://www.madewithnestle.ca/";
  }
  
  console.log(`Starting scraping from: ${startUrl}`);
  
  while (queue.length > 0 && results.length < MAX_PAGES) {
    const url = queue.shift() as string;
    
    // Skip if already visited
    if (visited.has(url)) continue;
    
    visited.add(url);
    
    try {
      console.log(`Scraping: ${url}`);
      const pageData = await scrapePage(url);
      results.push(pageData);
      
      // Add new links to queue
      for (const link of pageData.links) {
        if (!visited.has(link) && link.includes("madewithnestle.ca") && !queue.includes(link)) {
          queue.push(link);
        }
      }
      
      // Small delay to be respectful to the website
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
  
  console.log(`Scraped ${results.length} pages from Made with Nestlé website`);
  
  // After scraping, detect and add relationships between entities
  const enrichedResults = addEntityRelationships(results);
  
  return enrichedResults;
}

/**
 * Scrape a single page
 */
async function scrapePage(url: string): Promise<ScrapedPage> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NestleAI/1.0; +https://www.example.com/bot)",
      },
      timeout: 10000,
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract page title
    const title = $("title").text().trim() || $("h1").first().text().trim() || "Untitled Page";
    
    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr('content') || 
                          $('meta[property="og:description"]').attr('content') || "";
    
    // Extract categories and tags
    const categories: string[] = [];
    $(".category, .categories, .breadcrumbs a, .tags a").each((_, el) => {
      const category = $(el).text().trim();
      if (category && !categories.includes(category)) {
        categories.push(category);
      }
    });
    
    // Extract text content
    let content = "";
    $("p, h1, h2, h3, h4, h5, h6, li, article, section, .content, .main-content").each((_, element) => {
      const text = $(element).text().trim();
      if (text) {
        content += text + "\n\n";
      }
    });
    
    // Extract links (only those pointing to the same domain)
    const links: string[] = [];
    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        try {
          // Convert relative URLs to absolute
          const absoluteUrl = new URL(href, url).toString();
          if (absoluteUrl.includes("madewithnestle.ca")) {
            links.push(absoluteUrl);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    // Extract images with alt text
    const images: string[] = [];
    $("img").each((_, element) => {
      const src = $(element).attr("src");
      const alt = $(element).attr("alt") || "";
      if (src) {
        try {
          // Convert relative URLs to absolute
          const absoluteUrl = new URL(src, url).toString();
          images.push(absoluteUrl);
          
          // Add image with alt text to content for better context
          if (alt) {
            content += `[Image: ${alt}]\n`;
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    // Extract tables
    const tables: string[][] = [];
    $("table").each((_, table) => {
      const tableData: string[][] = [];
      
      $(table).find("tr").each((_, row) => {
        const rowData: string[] = [];
        
        // Process both th and td elements
        $(row).find("th, td").each((_, cell) => {
          rowData.push($(cell).text().trim());
        });
        
        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      });
      
      if (tableData.length > 0) {
        tables.push(tableData);
        
        // Add table content to main content
        content += "Table content:\n";
        tableData.forEach(row => {
          content += row.join(" | ") + "\n";
        });
        content += "\n";
      }
    });
    
    // Extract product information
    const productInfo = {
      name: $(".product-name, .product-title").text().trim() || "",
      brand: $(".brand-name, .brand").text().trim() || "",
      ingredients: [] as string[],
    };
    
    // Extract ingredients
    $(".ingredients li, .ingredients-list li").each((_, el) => {
      const ingredient = $(el).text().trim();
      if (ingredient) {
        productInfo.ingredients.push(ingredient);
      }
    });
    
    // If ingredients are in a paragraph
    const ingredientsText = $(".ingredients, .ingredients-list").text().trim();
    if (ingredientsText && productInfo.ingredients.length === 0) {
      const parts = ingredientsText.split(",");
      productInfo.ingredients = parts.map(part => part.trim()).filter(Boolean);
    }
    
    // Extract recipe information
    const recipeInfo = {
      prepTime: $(".prep-time, .preparation-time").text().trim() || "",
      cookTime: $(".cook-time, .cooking-time").text().trim() || "",
      servings: $(".servings, .yield").text().trim() || "",
      difficulty: $(".difficulty").text().trim() || "",
      nutrients: {} as Record<string, string>,
    };
    
    // Extract nutrition information
    $(".nutrition-fact, .nutrition-facts li, .nutritional-info li").each((_, el) => {
      const nutritionText = $(el).text().trim();
      
      // Try to parse as "nutrient: value"
      const match = nutritionText.match(/([^:]+):\s*(.+)/);
      if (match) {
        const [, nutrient, value] = match;
        recipeInfo.nutrients[nutrient.trim()] = value.trim();
      }
    });
    
    // Build metadata
    const metadata = {
      category: categories[0] || "",
      tags: categories,
      datePublished: $("meta[property='article:published_time']").attr("content") || "",
      description: metaDescription,
      productInfo: Object.values(productInfo).some(v => Boolean(v) && (typeof v === 'string' || v.length > 0)) ? productInfo : undefined,
      recipeInfo: Object.values(recipeInfo).some(v => {
        if (typeof v === 'object' && v !== null) {
          return Object.keys(v).length > 0;
        }
        return Boolean(v) && v !== '';
      }) ? recipeInfo : undefined,
    };
    
    return {
      url,
      title,
      content,
      links,
      images,
      tables,
      metadata,
      entityRelations: [], // Will be populated later
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return {
      url,
      title: "Error Page",
      content: "Failed to scrape this page.",
      links: [],
      images: [],
      tables: [],
      metadata: {},
      entityRelations: [],
    };
  }
}

/**
 * Add entity relationships based on content analysis
 */
function addEntityRelationships(pages: ScrapedPage[]): ScrapedPage[] {
  // Create a map of titles to URLs for quick lookup
  const titleToUrl = new Map<string, string>();
  pages.forEach(page => {
    if (page.title) {
      titleToUrl.set(page.title.toLowerCase(), page.url);
    }
  });
  
  // Process each page to identify relationships
  return pages.map(page => {
    const relations: Array<{source: string; relation: string; target: string}> = [];
    
    // Product-related relationships
    if (page.metadata.productInfo?.name) {
      // Product to brand
      if (page.metadata.productInfo.brand) {
        relations.push({
          source: page.metadata.productInfo.name,
          relation: "MADE_BY",
          target: page.metadata.productInfo.brand
        });
      }
      
      // Product to ingredients
      if (page.metadata.productInfo.ingredients?.length) {
        page.metadata.productInfo.ingredients.forEach(ingredient => {
          relations.push({
            source: page.metadata.productInfo.name,
            relation: "CONTAINS",
            target: ingredient
          });
        });
      }
      
      // Product to category
      if (page.metadata.category) {
        relations.push({
          source: page.metadata.productInfo.name,
          relation: "BELONGS_TO",
          target: page.metadata.category
        });
      }
    }
    
    // Page content relationship detection
    // Look for mentions of other pages
    pages.forEach(otherPage => {
      if (page.url !== otherPage.url && otherPage.title) {
        // Check if this page content mentions other pages
        if (page.content.toLowerCase().includes(otherPage.title.toLowerCase())) {
          relations.push({
            source: page.title,
            relation: "REFERENCES",
            target: otherPage.title
          });
        }
      }
    });
    
    // Set the derived relationships
    return {
      ...page,
      entityRelations: relations
    };
  });
}
