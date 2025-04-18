
import { Bookmark } from "../types";
import { extractDomainFromUrl } from "./bookmarkParser";

/**
 * Export bookmarks as standalone HTML file
 * @param bookmarks Array of bookmarks to export
 * @returns HTML string with embedded data
 */
export function exportToHTML(bookmarks: Bookmark[]): string {
  // Prepare bookmarks JSON data (safely encoded in a script tag)
  const bookmarksJSON = JSON.stringify(bookmarks)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');

  // Generate basic HTML for each bookmark
  const bookmarkListHTML = bookmarks.map(bookmark => {
    const domain = extractDomainFromUrl(bookmark.url);
    const faviconHTML = bookmark.favicon 
      ? `<img src="${bookmark.favicon}" alt="${domain}" class="favicon">` 
      : '';
    const tagsHTML = bookmark.tags.length > 0
      ? `<div class="tags">${bookmark.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
      : '';
    
    return `
      <div class="bookmark-item" data-id="${bookmark.id}">
        <h3>
          ${faviconHTML}
          <a href="${bookmark.url}" target="_blank">${bookmark.title}</a>
        </h3>
        ${bookmark.description ? `<p>${bookmark.description}</p>` : ''}
        ${tagsHTML}
        <div class="meta">
          <span class="date">Added: ${new Date(bookmark.dateAdded).toLocaleDateString()}</span>
          <span class="stats">👍 ${bookmark.likes} | 👎 ${bookmark.dislikes}</span>
        </div>
      </div>
    `;
  }).join('');

  // Create the full HTML document with embedded data and import functionality
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BookWise Exported Bookmarks</title>
  <style>
    :root {
      --background: #fff;
      --foreground: #111827;
      --muted: #f3f4f6;
      --primary: #6366f1;
      --border: #e5e7eb;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --background: #111827;
        --foreground: #f9fafb;
        --muted: #374151;
        --primary: #818cf8;
        --border: #374151;
      }
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: var(--background);
      color: var(--foreground);
      line-height: 1.5;
      margin: 0;
      padding: 2rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .bookmark-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    .bookmark-item {
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 1rem;
      background-color: var(--background);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .bookmark-item:hover {
      transform: translateY(-2px);
    }
    .bookmark-item h3 {
      margin-top: 0;
      display: flex;
      align-items: center;
    }
    .bookmark-item a {
      color: var(--primary);
      text-decoration: none;
    }
    .bookmark-item a:hover {
      text-decoration: underline;
    }
    .favicon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.75rem 0;
    }
    .tag {
      background-color: var(--muted);
      border-radius: 9999px;
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 1rem;
    }
    .btn {
      background-color: var(--primary);
      color: white;
      border: none;
      border-radius: 0.375rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .btn:hover {
      opacity: 0.9;
    }
    #importPanel {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      width: 300px;
      z-index: 10;
      transition: transform 0.3s;
    }
    #importPanel.hidden {
      transform: translateY(150%);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>BookWise Exported Bookmarks</h1>
      <button id="showImport" class="btn">Import to BookWise</button>
    </header>
    
    <div class="bookmark-list">
      ${bookmarkListHTML}
    </div>
  </div>
  
  <div id="importPanel" class="hidden">
    <h3>Import these bookmarks</h3>
    <p>You can import these bookmarks back into BookWise.</p>
    <button id="copyData" class="btn">Copy Data</button>
    <p><small>Open BookWise and paste in the Import section.</small></p>
  </div>

  <script>
    // Store embedded bookmark data
    const bookmarksData = ${bookmarksJSON};
    
    // Import panel toggle
    document.getElementById('showImport').addEventListener('click', () => {
      const panel = document.getElementById('importPanel');
      panel.classList.toggle('hidden');
    });
    
    // Copy data to clipboard
    document.getElementById('copyData').addEventListener('click', () => {
      const dataStr = JSON.stringify(bookmarksData);
      navigator.clipboard.writeText(dataStr).then(() => {
        alert('Bookmark data copied to clipboard');
      });
    });
  </script>
</body>
</html>
  `;
}

/**
 * Export bookmarks as OPML (Outline Processor Markup Language)
 * @param bookmarks Array of bookmarks to export
 * @returns OPML string
 */
export function exportToOPML(bookmarks: Bookmark[]): string {
  const now = new Date().toISOString();
  
  // Group bookmarks by tag
  const bookmarksByTag: Record<string, Bookmark[]> = {};
  
  // Add an "Untagged" category
  bookmarksByTag['Untagged'] = [];
  
  bookmarks.forEach(bookmark => {
    if (bookmark.tags.length === 0) {
      bookmarksByTag['Untagged'].push(bookmark);
    } else {
      bookmark.tags.forEach(tag => {
        if (!bookmarksByTag[tag]) {
          bookmarksByTag[tag] = [];
        }
        bookmarksByTag[tag].push(bookmark);
      });
    }
  });
  
  // Generate OPML content
  let opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>BookWise Bookmarks</title>
    <dateCreated>${now}</dateCreated>
  </head>
  <body>
`;

  // Add each tag as an outline
  Object.entries(bookmarksByTag).forEach(([tag, tagBookmarks]) => {
    opmlContent += `    <outline text="${tag}">\n`;
    
    // Add bookmarks within this tag
    tagBookmarks.forEach(bookmark => {
      opmlContent += `      <outline text="${bookmark.title.replace(/"/g, '&quot;')}" type="link" url="${bookmark.url}"`;
      
      if (bookmark.description) {
        opmlContent += ` description="${bookmark.description.replace(/"/g, '&quot;')}"`;
      }
      
      opmlContent += ` dateAdded="${new Date(bookmark.dateAdded).toISOString()}" />\n`;
    });
    
    opmlContent += `    </outline>\n`;
  });
  
  opmlContent += `  </body>
</opml>`;

  return opmlContent;
}

/**
 * Export bookmarks as JSON
 * @param bookmarks Array of bookmarks to export
 * @returns JSON string
 */
export function exportToJSON(bookmarks: Bookmark[]): string {
  return JSON.stringify(bookmarks, null, 2);
}
