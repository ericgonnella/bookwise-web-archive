
import { Bookmark } from "@/types";

// Categories for the AI to classify bookmarks into
export const BOOKMARK_CATEGORIES = [
  "tools",
  "frameworks",
  "libraries",
  "documentation",
  "tutorial",
  "blog",
  "article",
  "news",
  "social",
  "entertainment",
  "shopping",
  "travel",
  "finance",
  "education",
  "development",
  "technology",
  "health",
  "reference",
  "other"
];

/**
 * Process bookmarks with AI to enhance with descriptions and better categorization
 */
export async function enhanceBookmarksWithAI(bookmarks: Bookmark[]): Promise<Bookmark[]> {
  // For demo purposes, we'll simulate AI responses
  // In a real app, this would call an actual AI service like OpenAI API
  
  const enhancedBookmarks = await Promise.all(
    bookmarks.map(async (bookmark) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      const domain = extractDomainFromUrl(bookmark.url);
      let description = "";
      let aiTags: string[] = [];
      
      // Simple rule-based simulation of AI categorization
      if (bookmark.url.includes("github.com")) {
        description = "A GitHub repository or profile for software development and collaboration.";
        aiTags = ["development", "tools"];
      } else if (bookmark.url.includes("stackoverflow.com")) {
        description = "A programming Q&A platform for developers to share knowledge.";
        aiTags = ["development", "reference"];
      } else if (bookmark.url.includes("react")) {
        description = "Content related to the React JavaScript library for building user interfaces.";
        aiTags = ["libraries", "development", "frameworks"];
      } else if (bookmark.url.includes("tailwind")) {
        description = "Content about Tailwind CSS, a utility-first CSS framework.";
        aiTags = ["libraries", "development", "frameworks"];
      } else if (bookmark.url.includes("youtube")) {
        description = "A video sharing platform with various content.";
        aiTags = ["entertainment", "education"];
      } else if (bookmark.url.includes("medium.com")) {
        description = "An article or blog post from Medium's publishing platform.";
        aiTags = ["article", "blog"];
      } else if (bookmark.url.includes("news")) {
        description = "News article or publication providing current information.";
        aiTags = ["news"];
      } else if (bookmark.url.includes("docs") || bookmark.url.includes("documentation")) {
        description = `Documentation for ${domain} to help users understand its features and usage.`;
        aiTags = ["documentation", "reference"];
      } else {
        description = `Website on ${domain} with content related to ${guessCategory(bookmark.url)}.`;
        aiTags = [guessCategory(bookmark.url)];
      }
      
      return {
        ...bookmark,
        description: description,
        tags: [...new Set([...bookmark.tags, ...aiTags])].slice(0, 5) // Combine tags and limit to 5
      };
    })
  );
  
  return enhancedBookmarks;
}

// Helper to extract domain from URL
function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Simple category guessing function
function guessCategory(url: string): string {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes("github") || lowerUrl.includes("gitlab") || 
      lowerUrl.includes("code") || lowerUrl.includes("dev")) {
    return "development";
  }
  if (lowerUrl.includes("learn") || lowerUrl.includes("course") || 
      lowerUrl.includes("tutorial")) {
    return "education";
  }
  if (lowerUrl.includes("shop") || lowerUrl.includes("buy") || 
      lowerUrl.includes("store")) {
    return "shopping";
  }
  if (lowerUrl.includes("news") || lowerUrl.includes("times") || 
      lowerUrl.includes("post")) {
    return "news";
  }
  if (lowerUrl.includes("twitter") || lowerUrl.includes("facebook") || 
      lowerUrl.includes("instagram")) {
    return "social";
  }
  
  // Default category if no patterns match
  return "reference";
}
