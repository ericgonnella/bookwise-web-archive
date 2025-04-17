import { Bookmark } from "../types";
import { v4 as uuidv4 } from "uuid";

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
 * Generate tags based on the URL
 */
function generateTagsFromUrl(url: string): string[] {
  const tags: string[] = [];
  const lowercase = url.toLowerCase();
  
  // Common domain categories
  if (lowercase.includes('github') || lowercase.includes('stackoverflow') || 
      lowercase.includes('dev.to') || lowercase.includes('medium.com')) {
    tags.push('tech');
  }
  
  if (lowercase.includes('news') || lowercase.includes('bbc') || 
      lowercase.includes('cnn') || lowercase.includes('nytimes')) {
    tags.push('news');
  }
  
  if (lowercase.includes('recipe') || lowercase.includes('food') || 
      lowercase.includes('cooking') || lowercase.includes('allrecipes')) {
    tags.push('recipe');
  }
  
  if (lowercase.includes('facebook') || lowercase.includes('twitter') || 
      lowercase.includes('instagram') || lowercase.includes('linkedin')) {
    tags.push('social');
  }
  
  if (lowercase.includes('finance') || lowercase.includes('money') || 
      lowercase.includes('invest') || lowercase.includes('bank')) {
    tags.push('finance');
  }
  
  if (lowercase.includes('learn') || lowercase.includes('course') || 
      lowercase.includes('tutorial') || lowercase.includes('education')) {
    tags.push('education');
  }
  
  if (lowercase.includes('youtube') || lowercase.includes('netflix') || 
      lowercase.includes('hulu') || lowercase.includes('movie')) {
    tags.push('entertainment');
  }
  
  if (lowercase.includes('travel') || lowercase.includes('vacation') || 
      lowercase.includes('hotel') || lowercase.includes('booking')) {
    tags.push('travel');
  }
  
  // If no category was detected, add a default tag
  if (tags.length === 0) {
    const domain = extractDomainFromUrl(url);
    tags.push(domain.split('.')[0]); // Use the domain name as a tag
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
