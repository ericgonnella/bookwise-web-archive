
// Type definitions for Chrome and Firefox extensions APIs

interface ChromeBookmarks {
  getTree(callback: (results: chrome.bookmarks.BookmarkTreeNode[]) => void): void;
  get(idOrIdList: string | string[], callback: (results: chrome.bookmarks.BookmarkTreeNode[]) => void): void;
  getChildren(id: string, callback: (results: chrome.bookmarks.BookmarkTreeNode[]) => void): void;
  search(query: string | {
    query?: string;
    url?: string;
    title?: string;
  }, callback: (results: chrome.bookmarks.BookmarkTreeNode[]) => void): void;
}

interface ChromePermissions {
  request(permissions: { origins?: string[], permissions?: string[] }, callback: (granted: boolean) => void): void;
}

interface Chrome {
  bookmarks: ChromeBookmarks;
  permissions?: ChromePermissions;
}

declare global {
  var chrome: Chrome | undefined;

  // Firefox WebExtensions API
  var browser: {
    bookmarks: {
      getTree(): Promise<any[]>;
      get(idOrIdList: string | string[]): Promise<any[]>;
      getChildren(id: string): Promise<any[]>;
      search(query: { query?: string, url?: string, title?: string }): Promise<any[]>;
    };
    permissions?: {
      request(permissions: { origins?: string[], permissions?: string[] }): Promise<boolean>;
    }
  } | undefined;
}

export {};
