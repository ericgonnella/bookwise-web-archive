
import html2canvas from 'html2canvas';

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
      mode: 'cors', 
      credentials: 'omit',
      headers: { 'Accept': 'text/html' }
    });
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
    return {
      title: '',
      description: '',
      content: []
    };
  }
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

// Helper to extract domain from URL
function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Enhanced category guessing function that uses description content
function guessCategoryFromDescription(description: string): BookmarkCategory {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('framework') || lowerDesc.includes('library')) {
    return 'frameworks';
  }
  if (lowerDesc.includes('tool') || lowerDesc.includes('utility')) {
    return 'tools';
  }
  if (lowerDesc.includes('learn') || lowerDesc.includes('tutorial') || lowerDesc.includes('guide')) {
    return 'tutorial';
  }
  if (lowerDesc.includes('documentation') || lowerDesc.includes('docs') || lowerDesc.includes('reference')) {
    return 'documentation';
  }
  if (lowerDesc.includes('blog') || lowerDesc.includes('article')) {
    return 'article';
  }
  if (lowerDesc.includes('news')) {
    return 'news';
  }
  if (lowerDesc.includes('shop') || lowerDesc.includes('store')) {
    return 'shopping';
  }
  
  return guessCategory(description);
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

async function captureScreenshot(url: string): Promise<string | null> {
  try {
    // Create a temporary iframe to load the page
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';  // Hide off-screen
    iframe.style.width = '1024px';   // Standard width
    iframe.style.height = '768px';   // Standard height
    iframe.style.visibility = 'hidden';
    
    document.body.appendChild(iframe);
    
    // Wait for iframe to load
    await new Promise((resolve) => {
      iframe.onload = resolve;
      iframe.src = url;
    });

    try {
      // Try to access iframe content (may fail due to CORS)
      const canvas = await html2canvas(iframe.contentDocument?.documentElement || iframe.contentDocument?.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 0.5, // Reduce size for thumbnails
        logging: false,
        width: 1024,
        height: 768
      });
      
      const screenshot = canvas.toDataURL('image/jpeg', 0.5);
      return screenshot;
    } catch (canvasError) {
      console.error('Canvas generation failed:', canvasError);
      return null;
    } finally {
      // Clean up
      document.body.removeChild(iframe);
    }
  } catch (error) {
    console.error('Screenshot capture error:', error);
    return null;
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
      let screenshot: string | null = null;
      
      try {
        // Try to fetch page content - may fail due to CORS
        const pageData = await fetchPageContent(bookmark.url);
        
        // Generate description from whatever content we were able to get
        description = generateDescriptionFromContent({
          ...pageData,
          url: bookmark.url
        });
        
        // Try to get category from content
        const contentText = [pageData.title, description, ...pageData.content]
          .join(' ').toLowerCase();
        
        if (contentText.includes('framework') || contentText.includes('library')) {
          primaryCategory = 'frameworks';
        } else if (contentText.includes('tool') || contentText.includes('utility')) {
          primaryCategory = 'tools';
        } else if (contentText.includes('learn') || contentText.includes('tutorial')) {
          primaryCategory = 'tutorial';
        } else if (contentText.includes('documentation') || contentText.includes('reference')) {
          primaryCategory = 'documentation';
        } else if (contentText.includes('blog') || contentText.includes('article')) {
          primaryCategory = 'article';
        } else {
          // Fallback to URL-based categorization
          primaryCategory = guessCategory(bookmark.url);
        }
        
        // Try to capture screenshot - may fail due to CORS
        screenshot = await captureScreenshot(bookmark.url);
        
      } catch (error) {
        console.error(`Error processing bookmark ${bookmark.url}:`, error);
        // Fallback to URL-based categorization if content fetch fails
        primaryCategory = guessCategory(bookmark.url);
        description = `Resource from ${extractDomainFromUrl(bookmark.url)}`;
      }
      
      // Generate tags from category
      let aiTags: string[] = [primaryCategory];
      
      // Domain-specific tags
      const domain = extractDomainFromUrl(bookmark.url);
      if (domain.includes("github")) {
        aiTags.push("development");
      } else if (domain.includes("medium") || domain.includes("blog")) {
        aiTags.push("article");
      }
      
      // Limit tags to maximum 3 most relevant ones
      const finalTags = [...new Set([primaryCategory, ...aiTags.slice(0, 2)])];
      
      return {
        ...bookmark,
        description: description || bookmark.description || `Resource from ${extractDomainFromUrl(bookmark.url)}`,
        tags: finalTags.length > 0 ? finalTags : bookmark.tags,
        screenshot: screenshot || undefined
      };
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
