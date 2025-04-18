
import { v4 as uuid } from "uuid";
import { Bookmark } from "@/types";
import { tagBookmark } from "./tagger.service";

/**
 * Service for importing bookmarks directly from browsers
 */

// Chrome bookmark node type from the Chrome API
interface ChromeBookmarkNode {
  id: string;
  parentId?: string;
  index?: number;
  url?: string;
  title: string;
  dateAdded?: number;
  dateGroupModified?: number;
  children?: ChromeBookmarkNode[];
}

// Firefox bookmark type from the Firefox API
interface FirefoxBookmark {
  id: string;
  title: string;
  url?: string;
  type: "bookmark" | "folder" | "separator";
  dateAdded: number;
  lastModified: number;
  children?: FirefoxBookmark[];
  parentId?: string;
}

/**
 * Check if Chrome bookmarks API is available
 */
export const isChromeAvailable = (): boolean => {
  return typeof window !== 'undefined' &&
    typeof chrome !== 'undefined' &&
    chrome.bookmarks !== undefined;
};

/**
 * Check if Firefox bookmarks API is available
 */
export const isFirefoxAvailable = (): boolean => {
  return typeof window !== 'undefined' &&
    typeof browser !== 'undefined' &&
    browser.bookmarks !== undefined;
};

/**
 * Get the browser type (Chrome, Firefox, or Unknown)
 */
export const getBrowserType = (): 'chrome' | 'firefox' | 'unknown' => {
  if (isChromeAvailable()) return 'chrome';
  if (isFirefoxAvailable()) return 'firefox';
  return 'unknown';
};

/**
 * Convert Chrome bookmark nodes to our app's bookmark format
 */
const convertChromeBookmarks = (nodes: ChromeBookmarkNode[]): Bookmark[] => {
  const bookmarks: Bookmark[] = [];

  const processNode = (node: ChromeBookmarkNode) => {
    // Only process nodes with URLs (actual bookmarks)
    if (node.url) {
      // Skip Chrome internal pages
      if (node.url.startsWith('chrome://') || node.url.startsWith('edge://')) {
        return;
      }

      const dateAdded = node.dateAdded ? new Date(node.dateAdded) : new Date();
      
      // Create bookmark from Chrome's data
      const bookmark: Bookmark = {
        id: uuid(),
        title: node.title || "Untitled",
        url: node.url,
        dateAdded,
        tags: tagBookmark(node.url, node.title),
        likes: 0,
        dislikes: 0,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(node.url).hostname}`,
        analytics: {
          views: 0,
          reactions: 0
        }
      };
      
      bookmarks.push(bookmark);
    }
    
    // Recursively process children
    if (node.children) {
      node.children.forEach(processNode);
    }
  };
  
  nodes.forEach(processNode);
  return bookmarks;
};

/**
 * Convert Firefox bookmarks to our app's bookmark format
 */
const convertFirefoxBookmarks = (nodes: FirefoxBookmark[]): Bookmark[] => {
  const bookmarks: Bookmark[] = [];

  const processNode = (node: FirefoxBookmark) => {
    // Only process nodes with URLs (actual bookmarks)
    if (node.type === 'bookmark' && node.url) {
      // Skip Firefox internal pages
      if (node.url.startsWith('about:') || node.url.startsWith('moz-extension://')) {
        return;
      }

      const dateAdded = node.dateAdded ? new Date(node.dateAdded) : new Date();
      
      // Create bookmark from Firefox's data
      const bookmark: Bookmark = {
        id: uuid(),
        title: node.title || "Untitled",
        url: node.url,
        dateAdded,
        tags: tagBookmark(node.url, node.title),
        likes: 0,
        dislikes: 0,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(node.url).hostname}`,
        analytics: {
          views: 0,
          reactions: 0
        }
      };
      
      bookmarks.push(bookmark);
    }
    
    // Recursively process children
    if (node.children) {
      node.children.forEach(processNode);
    }
  };
  
  nodes.forEach(processNode);
  return bookmarks;
};

/**
 * Import bookmarks from Chrome
 */
export const importFromChrome = (): Promise<Bookmark[]> => {
  return new Promise((resolve, reject) => {
    if (!isChromeAvailable()) {
      reject(new Error("Chrome bookmarks API is not available"));
      return;
    }

    try {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const bookmarks = convertChromeBookmarks(bookmarkTreeNodes);
        resolve(bookmarks);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Import bookmarks from Firefox
 */
export const importFromFirefox = (): Promise<Bookmark[]> => {
  return new Promise((resolve, reject) => {
    if (!isFirefoxAvailable()) {
      reject(new Error("Firefox bookmarks API is not available"));
      return;
    }

    try {
      browser.bookmarks.getTree().then((bookmarkItems) => {
        const bookmarks = convertFirefoxBookmarks(bookmarkItems);
        resolve(bookmarks);
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get browser permissions required for bookmark access
 * @returns A promise that resolves when permissions are granted
 */
export const requestBrowserPermissions = async (): Promise<boolean> => {
  if (isChromeAvailable() && chrome.permissions) {
    return new Promise((resolve) => {
      chrome.permissions.request(
        { permissions: ['bookmarks'] },
        (granted) => {
          resolve(granted || false);
        }
      );
    });
  } else if (isFirefoxAvailable() && browser.permissions) {
    return browser.permissions.request({ permissions: ['bookmarks'] });
  }
  
  return Promise.resolve(false);
};

/**
 * Import bookmarks from the current browser
 */
export const importFromBrowser = async (): Promise<Bookmark[]> => {
  const browserType = getBrowserType();
  
  if (browserType === 'chrome') {
    return importFromChrome();
  } else if (browserType === 'firefox') {
    return importFromFirefox();
  } else {
    throw new Error("Browser bookmarks API is not supported");
  }
};
