import { v4 as uuidv4 } from "uuid";
import { Bookmark } from "../types";

/**
 * Parse bookmarks HTML file into structured bookmark objects
 * 
 * @param html HTML string from the bookmarks file
 * @returns Array of parsed bookmarks
 */
export function parseBookmarksHtml(html: string): Bookmark[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const bookmarks: Bookmark[] = [];
  
  // Find all A tags in the document
  const bookmarkElements = doc.querySelectorAll("a");
  
  bookmarkElements.forEach((element) => {
    const url = element.getAttribute("href");
    if (!url) return; // Skip if no URL
    
    const title = element.textContent?.trim() || extractDomainFromUrl(url);
    const dateAddedAttr = element.getAttribute("add_date");
    
    // Convert UNIX timestamp to Date if available, or use current date
    const dateAdded = dateAddedAttr 
      ? new Date(parseInt(dateAddedAttr) * 1000)
      : new Date();
    
    // Auto-generate tags based on URL
    const tags = generateTagsFromUrl(url);
    
    // Try to get the favicon
    const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}`;
    
    bookmarks.push({
      id: uuidv4(),
      title,
      url,
      dateAdded,
      favicon,
      tags,
      description: "",
      likes: 0,
      dislikes: 0
    });
  });
  
  // Filter out duplicates by URL, keeping the latest one
  const uniqueBookmarks = removeDuplicatesByUrl(bookmarks);
  
  return uniqueBookmarks;
}

/**
 * Remove duplicate bookmarks by URL, keeping the most recently added
 */
function removeDuplicatesByUrl(bookmarks: Bookmark[]): Bookmark[] {
  const urlMap = new Map<string, Bookmark>();
  
  bookmarks.forEach(bookmark => {
    const existing = urlMap.get(bookmark.url);
    
    if (!existing || bookmark.dateAdded > existing.dateAdded) {
      urlMap.set(bookmark.url, bookmark);
    }
  });
  
  return Array.from(urlMap.values());
}

/**
 * Extract domain name from URL for use as fallback title or tag
 */
export function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Generate tags based on the URL and content
 */
function generateTagsFromUrl(url: string): string[] {
  const tags: string[] = [];
  const lowercase = url.toLowerCase();
  
  // Define category rules with multiple related terms
  const categories = {
    development: ['github.com', 'stackoverflow.com', 'dev.to', 'gitlab.com', 'bitbucket.org', 'npm', 'github', 'stackoverflow'],
    news: ['news', 'bbc.com', 'reuters.com', 'cnn.com', 'nytimes.com', 'bloomberg.com'],
    food: ['recipe', 'food', 'cooking', 'allrecipes.com', 'foodnetwork.com', 'epicurious.com'],
    social: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'tiktok.com'],
    finance: ['finance', 'investing.com', 'marketwatch.com', 'bloomberg.com', 'yahoo.com/finance'],
    education: ['coursera.org', 'udemy.com', 'edx.org', 'khan academy', 'educational'],
    entertainment: ['youtube.com', 'netflix.com', 'hulu.com', 'spotify.com', 'disney'],
    shopping: ['amazon.com', 'ebay.com', 'etsy.com', 'shop', 'store'],
    travel: ['booking.com', 'airbnb.com', 'expedia.com', 'tripadvisor.com', 'travel']
  };

  // Check URL against each category
  Object.entries(categories).forEach(([category, terms]) => {
    if (terms.some(term => lowercase.includes(term))) {
      tags.push(category);
    }
  });

  // Only add domain as tag if no other tags were found and it's a known service
  if (tags.length === 0) {
    const domain = extractDomainFromUrl(url);
    const mainDomain = domain.split('.')[0];
    // Only add domain tag if it's longer than 3 characters to avoid generic tags
    if (mainDomain.length > 3) {
      tags.push(mainDomain);
    }
  }

  return tags;
}

/**
 * Sample bookmarks for demo/development
 */
export function getSampleBookmarks(): Bookmark[] {
  return [
    {
      id: uuidv4(),
      title: "GitHub: Where the world builds software",
      url: "https://github.com",
      dateAdded: new Date(2023, 3, 15),
      favicon: "https://www.google.com/s2/favicons?domain=github.com",
      tags: ["tech", "development"],
      description: "GitHub is where over 100 million developers shape the future of software.",
      likes: 42,
      dislikes: 2
    },
    {
      id: uuidv4(),
      title: "Stack Overflow - Where Developers Learn, Share, & Build",
      url: "https://stackoverflow.com",
      dateAdded: new Date(2023, 2, 20),
      favicon: "https://www.google.com/s2/favicons?domain=stackoverflow.com",
      tags: ["tech", "programming", "community"],
      description: "Stack Overflow is the largest, most trusted online community for developers.",
      likes: 38,
      dislikes: 1
    },
    {
      id: uuidv4(),
      title: "BBC - Homepage",
      url: "https://www.bbc.com",
      dateAdded: new Date(2023, 4, 5),
      favicon: "https://www.google.com/s2/favicons?domain=bbc.com",
      tags: ["news"],
      description: "Breaking news, sport, TV, radio and more.",
      likes: 15,
      dislikes: 3
    },
    {
      id: uuidv4(),
      title: "Netflix - Watch TV Shows Online, Watch Movies Online",
      url: "https://www.netflix.com",
      dateAdded: new Date(2023, 1, 10),
      favicon: "https://www.google.com/s2/favicons?domain=netflix.com",
      tags: ["entertainment", "streaming"],
      description: "Watch Netflix movies & TV shows online or stream right to your smart TV.",
      likes: 67,
      dislikes: 4
    },
    {
      id: uuidv4(),
      title: "Epicurious - Recipes, Menu Ideas, Videos & Cooking Tips",
      url: "https://www.epicurious.com",
      dateAdded: new Date(2023, 5, 2),
      favicon: "https://www.google.com/s2/favicons?domain=epicurious.com",
      tags: ["recipe", "food"],
      description: "Cook with confidence using Epicurious' food guides and recipe collections.",
      likes: 29,
      dislikes: 0
    },
    {
      id: uuidv4(),
      title: "MDN Web Docs",
      url: "https://developer.mozilla.org",
      dateAdded: new Date(2023, 0, 25),
      favicon: "https://www.google.com/s2/favicons?domain=developer.mozilla.org",
      tags: ["tech", "development", "reference"],
      description: "Resources for developers, by developers.",
      likes: 51,
      dislikes: 1
    },
  ];
}
