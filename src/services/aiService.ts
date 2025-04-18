import html2canvas from 'html2canvas';
import { Bookmark, BookmarkCategory } from "../types";
import { tagBookmark } from "./tagger.service";

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

// Color mapping for different bookmark categories
const CATEGORY_COLORS = {
  development: '#8B5CF6', // Vivid Purple
  tools: '#0EA5E9',      // Ocean Blue
  frameworks: '#6E59A5',  // Tertiary Purple
  libraries: '#7E69AB',   // Secondary Purple
  documentation: '#D3E4FD', // Soft Blue
  tutorial: '#F2FCE2',    // Soft Green
  blog: '#FDE1D3',       // Soft Peach
  article: '#E5DEFF',    // Soft Purple
  news: '#FEF7CD',       // Soft Yellow
  social: '#FFDEE2',     // Soft Pink
  entertainment: '#FEC6A1', // Soft Orange
  shopping: '#F97316',    // Bright Orange
  programming: '#3B82F6', // Blue
  tech: '#10B981',       // Green
  education: '#8B5CF6',  // Purple
  community: '#EC4899',  // Pink
  reference: '#6366F1',  // Indigo
  other: '#8E9196'       // Neutral Gray
} as const;

// Get color based on bookmark category
function getCategoryColor(category: BookmarkCategory): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
}

// Generate a placeholder image with site domain and category-based colors
function generatePlaceholderImage(domain: string, category: BookmarkCategory = 'other'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Use category color for background
    const bgColor = getCategoryColor(category);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add a subtle pattern
    ctx.strokeStyle = `${bgColor}80`; // 50% opacity
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    
    // Draw domain name
    ctx.font = 'bold 28px system-ui';
    ctx.fillStyle = category === 'documentation' || category === 'tutorial' ? '#333333' : '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Handle long domain names
    const maxWidth = canvas.width - 40;
    let fontSize = 28;
    while (ctx.measureText(domain).width > maxWidth && fontSize > 16) {
      fontSize--;
      ctx.font = `bold ${fontSize}px system-ui`;
    }
    
    ctx.fillText(domain, canvas.width / 2, canvas.height / 2);
    
    // Draw category label
    ctx.font = '16px system-ui';
    ctx.fillStyle = category === 'documentation' || category === 'tutorial' ? '#666666' : '#FFFFFF';
    ctx.fillText(category.toUpperCase(), canvas.width / 2, canvas.height / 2 + 40);
  }
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

async function fetchMetaDescription(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try to get meta description
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                          doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
    
    return metaDescription || '';
  } catch (error) {
    console.error('Error fetching meta description:', error);
    return '';
  }
}

async function fetchPageContent(url: string): Promise<{ 
  title: string;
  description: string;
  content: string[];
}> {
  try {
    const response = await fetch(url, { 
      mode: 'no-cors', // Try no-cors mode first
      credentials: 'omit',
      headers: { 'Accept': 'text/html' }
    });
    
    // Since no-cors returns opaque responses, we might not be able to read content
    // Let's check if we got a valid response
    if (!response.ok && response.type === 'opaque') {
      console.log('Using fallback for:', url);
      return getFallbackPageInfo(url);
    }
    
    const html = await response.text();
    
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get meta description
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                          doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
    
    // Get main content
    const mainContent = Array.from(doc.querySelectorAll('p, h1, h2, h3, article'))
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 20) // Filter out short snippets
      .slice(0, 5); // Take first 5 meaningful content blocks
    
    // Get title
    const pageTitle = doc.querySelector('title')?.textContent || '';
    
    return {
      title: pageTitle,
      description: metaDescription || '',
      content: mainContent
    };
  } catch (error) {
    console.error('Error fetching page content:', error);
    return getFallbackPageInfo(url);
  }
}

function getFallbackPageInfo(url: string): { title: string; description: string; content: string[] } {
  const domain = extractDomainFromUrl(url);
  const pathParts = new URL(url).pathname.split('/').filter(Boolean);
  
  // Make a title based on URL parts
  let title = domain;
  if (pathParts.length > 0) {
    const lastPart = pathParts[pathParts.length - 1]
      .replace(/[-_]/g, ' ')
      .replace(/\.\w+$/, ''); // Remove file extensions
    
    if (lastPart) {
      title = `${lastPart.charAt(0).toUpperCase() + lastPart.slice(1)} - ${domain}`;
    }
  }
  
  return {
    title: title,
    description: `Resource from ${domain}`,
    content: [`This page is from ${domain}`]
  };
}

function generateDescriptionFromContent(pageData: { 
  title: string;
  description: string;
  content: string[];
  url: string;
}): string {
  const domain = extractDomainFromUrl(pageData.url);
  
  // If we have a meta description, use it
  if (pageData.description) {
    return pageData.description;
  }
  
  // If we have meaningful content, create a description
  if (pageData.content.length > 0) {
    // Take the first meaningful content block and trim it
    const mainContent = pageData.content[0]
      .replace(/\s+/g, ' ')
      .slice(0, 150);
    
    return `${mainContent}...`;
  }
  
  // If we have at least a title, use it
  if (pageData.title) {
    return `Resource about ${pageData.title.replace(/\s+/g, ' ')}`;
  }
  
  // Fallback with improved generic description
  if (domain.includes("github")) {
    return "A GitHub repository containing software development resources or code.";
  } else if (domain.includes("docs") || domain.includes("documentation")) {
    return `Technical documentation or guides from ${domain}.`;
  } else if (domain.includes("blog") || domain.includes("medium")) {
    return `Article or blog post from ${domain}.`;
  }
  
  return `Resource from ${domain}`;
}

function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function guessCategoryFromDescription(description: string, url: string, title: string): BookmarkCategory {
  // Use our new tagging service for better categorization
  const tags = tagBookmark(url, title, description);
  return tags[0]; // Return the first tag as the primary category
}

function guessCategory(url: string, title: string = ""): BookmarkCategory {
  // Use our new tagging service for more accurate categorization
  const tags = tagBookmark(url, title);
  return tags[0]; // Return the first tag as the primary category
}

async function captureScreenshot(url: string, category: BookmarkCategory = 'other'): Promise<string | null> {
  try {
    const domain = extractDomainFromUrl(url);
    // Skip the iframe attempt and directly return a placeholder
    return generatePlaceholderImage(domain, category);
  } catch (error) {
    console.error('Screenshot generation error:', error);
    const domain = extractDomainFromUrl(url);
    return generatePlaceholderImage(domain, 'other');
  }
}

/**
 * Process a batch of bookmarks with AI enhancement
 */
async function processBatch(bookmarks: Bookmark[]): Promise<Bookmark[]> {
  return Promise.all(
    bookmarks.map(async (bookmark) => {
      let description = "";
      let primaryCategory: BookmarkCategory = "other";
      
      try {
        // Try to fetch page content for categorization
        const pageData = await fetchPageContent(bookmark.url);
        description = generateDescriptionFromContent({
          ...pageData,
          url: bookmark.url
        });
        
        // Determine category from content using our improved tagging service
        primaryCategory = guessCategoryFromDescription(description, bookmark.url, bookmark.title);
        
        // Get additional tags for better categorization
        const tags = tagBookmark(bookmark.url, bookmark.title, description);
        
        // Generate screenshot with category color
        const screenshot = await captureScreenshot(bookmark.url, primaryCategory);
        
        return {
          ...bookmark,
          description: description || `Resource from ${extractDomainFromUrl(bookmark.url)}`,
          tags: tags, // Use all tags from the tagging service
          screenshot: screenshot || undefined
        };
      } catch (error) {
        console.error(`Error processing bookmark ${bookmark.url}:`, error);
        // Fallback to URL-based categorization
        const tags = tagBookmark(bookmark.url, bookmark.title);
        primaryCategory = tags[0];
        const screenshot = await captureScreenshot(bookmark.url, primaryCategory);
        
        return {
          ...bookmark,
          description: `Resource from ${extractDomainFromUrl(bookmark.url)}`,
          tags: tags,
          screenshot: screenshot || undefined
        };
      }
    })
  );
}

/**
 * Process bookmarks with AI in batches to enhance with descriptions and better categorization
 */
export async function enhanceBookmarksWithAI(
  bookmarks: Bookmark[], 
  batchSize: number = 5,
  onProgress?: (processed: number, total: number) => void
): Promise<Bookmark[]> {
  const enhancedBookmarks: Bookmark[] = [];
  const totalBookmarks = bookmarks.length;
  
  // Process bookmarks in batches
  for (let i = 0; i < totalBookmarks; i += batchSize) {
    const batch = bookmarks.slice(i, i + batchSize);
    try {
      // Try to capture screenshots in parallel
      const processedBatch = await Promise.all(
        batch.map(async (bookmark) => {
          const [processedBookmark, screenshot] = await Promise.all([
            processBatch([bookmark]).then(results => results[0]),
            captureScreenshot(bookmark.url)
          ]);
          
          return {
            ...processedBookmark,
            screenshot: screenshot || undefined
          };
        })
      );
      
      enhancedBookmarks.push(...processedBatch);
    } catch (error) {
      console.error(`Error processing batch ${i}-${i+batchSize}:`, error);
      // If batch processing fails, add the original bookmarks
      enhancedBookmarks.push(...batch);
    }
    
    // Report progress if callback provided
    if (onProgress) {
      onProgress(Math.min(i + batchSize, totalBookmarks), totalBookmarks);
    }
    
    // Add a small delay between batches to prevent overwhelming
    if (i + batchSize < totalBookmarks) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return enhancedBookmarks;
}
