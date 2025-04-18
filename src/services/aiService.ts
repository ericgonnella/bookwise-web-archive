
import { Bookmark, BookmarkCategory } from "@/types";

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
  "development",
  "technology",
  "reference",
  "other"
] as const;

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
      let primaryCategory: BookmarkCategory = "other";
      let aiTags: string[] = [];
      
      // Improved categorization logic
      if (bookmark.url.includes("github.com")) {
        description = "A GitHub repository for software development.";
        primaryCategory = "development";
        aiTags = ["development", "tools"];
      } else if (bookmark.url.includes("stackoverflow.com")) {
        description = "A programming Q&A resource.";
        primaryCategory = "reference";
        aiTags = ["development"];
      } else if (bookmark.url.includes("react") || bookmark.url.includes("vue") || bookmark.url.includes("angular")) {
        description = "Frontend framework related content.";
        primaryCategory = "frameworks";
        aiTags = ["development", "frameworks"];
      } else if (bookmark.url.includes("npm") || bookmark.url.includes("yarn")) {
        description = "Package management resource.";
        primaryCategory = "tools";
        aiTags = ["development"];
      } else if (bookmark.url.includes("docs") || bookmark.url.includes("documentation")) {
        description = `Documentation for ${domain}.`;
        primaryCategory = "documentation";
        aiTags = ["reference"];
      } else if (bookmark.url.includes("tutorial") || bookmark.url.includes("learn")) {
        description = `Educational content about ${domain}.`;
        primaryCategory = "tutorial";
        aiTags = ["education"];
      } else {
        description = `Website on ${domain}`;
        primaryCategory = guessCategory(bookmark.url);
        aiTags = [primaryCategory];
      }
      
      // Limit tags to maximum 3 most relevant ones
      const finalTags = [...new Set([primaryCategory, ...aiTags.slice(0, 2)])];
      
      return {
        ...bookmark,
        description,
        tags: finalTags
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

// Enhanced category guessing function
function guessCategory(url: string): BookmarkCategory {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes("github") || lowerUrl.includes("gitlab") || 
      lowerUrl.includes("code") || lowerUrl.includes("dev")) {
    return "development";
  }
  if (lowerUrl.includes("learn") || lowerUrl.includes("course") || 
      lowerUrl.includes("tutorial")) {
    return "tutorial";
  }
  if (lowerUrl.includes("shop") || lowerUrl.includes("buy") || 
      lowerUrl.includes("store")) {
    return "shopping";
  }
  if (lowerUrl.includes("news") || lowerUrl.includes("blog")) {
    return "article";
  }
  if (lowerUrl.includes("twitter") || lowerUrl.includes("facebook") || 
      lowerUrl.includes("instagram")) {
    return "social";
  }
  
  return "other";
}
