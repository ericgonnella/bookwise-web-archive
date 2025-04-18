import { Bookmark, BookmarkCategory } from "@/types";
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
    const response = await fetch(url);
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
    const response = await fetch(url);
    const html = await response.text();
    
    // Create an iframe to load the page
    const iframe = document.createElement('iframe');
    iframe.style.width = '1200px';
    iframe.style.height = '800px';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);
    
    // Write the HTML content to the iframe
    const iframeDoc = iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
    }
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Capture screenshot
    const canvas = await html2canvas(iframe.contentDocument?.body || document.createElement('div'));
    const screenshot = canvas.toDataURL('image/jpeg', 0.5); // Use JPEG with 50% quality for smaller size
    
    // Clean up
    document.body.removeChild(iframe);
    
    return screenshot;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
}

/**
 * Process bookmarks with AI to enhance with descriptions and better categorization
 */
export async function enhanceBookmarksWithAI(bookmarks: Bookmark[]): Promise<Bookmark[]> {
  const enhancedBookmarks = await Promise.all(
    bookmarks.map(async (bookmark) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      // Fetch page content and screenshot in parallel
      const [pageData, screenshot] = await Promise.all([
        fetchPageContent(bookmark.url),
        captureScreenshot(bookmark.url)
      ]);

      let description = generateDescriptionFromContent({
        ...pageData,
        url: bookmark.url
      });
      
      let primaryCategory: BookmarkCategory = "other";
      let aiTags: string[] = [];
      
      // Use content for better categorization
      const contentText = [pageData.title, description, ...pageData.content]
        .join(' ').toLowerCase();
      
      if (contentText.includes('framework') || contentText.includes('library')) {
        primaryCategory = 'frameworks';
        aiTags = ['development'];
      } else if (contentText.includes('tool') || contentText.includes('utility')) {
        primaryCategory = 'tools';
        aiTags = ['development'];
      } else if (contentText.includes('learn') || contentText.includes('tutorial')) {
        primaryCategory = 'tutorial';
        aiTags = ['education'];
      } else if (contentText.includes('documentation') || contentText.includes('reference')) {
        primaryCategory = 'documentation';
        aiTags = ['reference'];
      } else if (contentText.includes('blog') || contentText.includes('article')) {
        primaryCategory = 'article';
        aiTags = ['blog'];
      } else {
        // Fallback to URL-based categorization
        primaryCategory = guessCategory(bookmark.url);
        aiTags = [primaryCategory];
      }
      
      // Limit tags to maximum 3 most relevant ones
      const finalTags = [...new Set([primaryCategory, ...aiTags.slice(0, 2)])];
      
      return {
        ...bookmark,
        description,
        tags: finalTags,
        screenshot: screenshot || undefined
      };
    })
  );
  
  return enhancedBookmarks;
}
