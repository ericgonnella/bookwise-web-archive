
import { BookmarkCategory } from "../types";

// Taxonomy of categories
export const CATEGORIES = [
  "tech",
  "programming",
  "tools",
  "streaming",
  "news",
  "shopping",
  "social",
  "education",
  "development",
  "documentation",
  "entertainment",
  "tutorial",
  "article",
  "reference",
  "community",
  "other",
] as const;

// Mapping from domain to category
export const DOMAIN_OVERRIDES: Record<string, BookmarkCategory> = {
  "github.com": "development",
  "github.io": "development",
  "gitlab.com": "development",
  "stackoverflow.com": "programming",
  "netlify.app": "development",
  "vercel.app": "development",
  "heroku.com": "development",
  "docs.google.com": "documentation",
  "notion.so": "documentation",
  "figma.com": "tools",
  "netflix.com": "entertainment",
  "youtube.com": "streaming",
  "amazon.com": "shopping",
  "twitter.com": "social",
  "x.com": "social",
  "medium.com": "article",
  "dev.to": "programming",
  "npmjs.com": "programming",
  "w3schools.com": "tutorial",
  "mdn.mozilla.org": "documentation",
  "developer.mozilla.org": "documentation",
  "reactjs.org": "documentation",
  "vuejs.org": "documentation",
  "angular.io": "documentation",
  "reddit.com": "community",
  "news.ycombinator.com": "news",
  "coursera.org": "education",
  "udemy.com": "education",
  "edx.org": "education",
  "stackexchange.com": "reference",
  "cnn.com": "news",
  "bbc.com": "news",
  "nytimes.com": "news",
};

// Keyword patterns to help categorize content
export const KEYWORD_BUCKETS: Record<string, string[]> = {
  programming: ["javascript", "typescript", "python", "java", "c++", "ruby", "php", "golang", "api", "sdk", "git", "node.js", "react", "vue", "angular"],
  tools: ["figma", "docker", "kubernetes", "jira", "postman", "webpack", "vite", "eslint", "prettier", "babel"],
  streaming: ["netflix", "hulu", "spotify", "twitch", "youtube", "disney+", "prime video", "hbo max"],
  news: ["cnn", "bbc", "reuters", "nytimes", "guardian", "washington post", "breaking news", "latest news"],
  documentation: ["docs", "documentation", "reference", "manual", "guide", "handbook", "specification", "api reference"],
  development: ["development", "coding", "programming", "engineering", "software", "web dev", "app dev", "frontend", "backend"],
  education: ["course", "tutorial", "learn", "education", "training", "bootcamp", "workshop", "certification"],
  tutorial: ["tutorial", "guide", "how to", "learn", "step by step", "beginner", "introduction"],
  article: ["article", "blog post", "essay", "opinion", "analysis", "review"],
  entertainment: ["entertainment", "movie", "tv show", "series", "game", "music", "video"],
  reference: ["reference", "dictionary", "encyclopedia", "glossary", "cheatsheet"],
  community: ["forum", "community", "discussion", "group", "network"],
  tech: ["technology", "tech", "ai", "machine learning", "blockchain", "cryptocurrency", "iot", "robotics"],
  social: ["social media", "facebook", "twitter", "instagram", "linkedin", "tiktok", "pinterest"],
  shopping: ["shop", "store", "buy", "purchase", "product", "deal"],
};

/**
 * Normalizes a URL by converting to lowercase and extracting the domain
 * @param url The URL to normalize
 * @returns The normalized domain
 */
function normalizeDomain(url: string): string {
  try {
    // Extract domain from URL
    const urlObj = new URL(url);
    // Remove www. prefix and get hostname
    return urlObj.hostname.replace(/^www\./, '').toLowerCase();
  } catch (error) {
    // If URL parsing fails, return the original
    return url.toLowerCase();
  }
}

/**
 * Checks if text contains any keywords from the specified bucket
 * @param text The text to check
 * @param bucket Array of keywords to check against
 * @returns True if any keyword is found
 */
function containsKeywords(text: string, bucket: string[]): boolean {
  const lowerText = text.toLowerCase();
  return bucket.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Tag a bookmark based on its URL, title, and description
 * @param url The bookmark URL
 * @param title The bookmark title
 * @param description The bookmark description
 * @returns An array of categories for the bookmark
 */
export function tagBookmark(
  url: string,
  title: string = "",
  description: string = ""
): BookmarkCategory[] {
  // Step 1: Check domain overrides
  const domain = normalizeDomain(url);
  if (DOMAIN_OVERRIDES[domain]) {
    return [DOMAIN_OVERRIDES[domain]];
  }
  
  // Check for common domains and subdomains
  for (const [baseDomain, category] of Object.entries(DOMAIN_OVERRIDES)) {
    if (domain.endsWith(`.${baseDomain}`) || domain === baseDomain) {
      return [category as BookmarkCategory];
    }
  }
  
  // Step 2: Create a text blob for keyword matching
  const textBlob = `${url} ${title} ${description}`.toLowerCase();
  
  // Step 3: Check keyword buckets
  const matchedCategories: BookmarkCategory[] = [];
  
  for (const [category, keywords] of Object.entries(KEYWORD_BUCKETS)) {
    if (containsKeywords(textBlob, keywords)) {
      matchedCategories.push(category as BookmarkCategory);
      if (matchedCategories.length >= 2) {
        // Limit to 2 categories max
        break;
      }
    }
  }
  
  // If we found categories based on keywords, return them
  if (matchedCategories.length > 0) {
    return matchedCategories;
  }
  
  // Step 4: URL path analysis for additional clues
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);
    
    for (const segment of pathSegments) {
      const segmentText = segment.replace(/-|_/g, ' ').toLowerCase();
      
      for (const [category, keywords] of Object.entries(KEYWORD_BUCKETS)) {
        if (containsKeywords(segmentText, keywords)) {
          return [category as BookmarkCategory];
        }
      }
    }
  } catch (error) {
    // Silently ignore URL parsing errors
  }
  
  // Final fallback to tech or other based on TLD
  if (domain.endsWith('.dev') || domain.endsWith('.io') || domain.endsWith('.tech')) {
    return ['tech'];
  } else if (domain.endsWith('.edu') || url.includes('learn') || url.includes('course')) {
    return ['education'];
  } else if (url.includes('blog') || title.toLowerCase().includes('blog')) {
    return ['article'];
  } else if (url.includes('forum') || url.includes('community')) {
    return ['community'];
  } else if (url.includes('shop') || url.includes('store')) {
    return ['shopping'];
  }
  
  // Absolute fallback
  return ['other'];
}
