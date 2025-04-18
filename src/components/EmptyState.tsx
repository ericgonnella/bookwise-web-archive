
import React from "react";
import { Bookmark, Chrome, Firefox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrowserType } from "@/services/browserImport.service";

interface EmptyStateProps {
  onImportClick: () => void;
  onBrowserImportClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onImportClick, onBrowserImportClick }) => {
  const browserType = getBrowserType();
  const isBrowserSupported = browserType === 'chrome' || browserType === 'firefox';
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Bookmark className="h-10 w-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold mb-3">No Bookmarks Yet</h2>
      
      <p className="text-muted-foreground max-w-md mb-6">
        Import your bookmarks from an HTML file or directly from your browser to get started.
      </p>
      
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={onImportClick} className="flex items-center gap-2">
          Import from File
        </Button>
        
        {isBrowserSupported && onBrowserImportClick && (
          <Button 
            onClick={onBrowserImportClick}
            variant="outline"
            className="flex items-center gap-2"
          >
            {browserType === 'chrome' ? (
              <Chrome className="h-4 w-4" />
            ) : (
              <Firefox className="h-4 w-4" />
            )}
            Import from {browserType === 'chrome' ? 'Chrome' : 'Firefox'}
          </Button>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-muted rounded-lg max-w-sm">
        <h3 className="font-semibold mb-2">How to export bookmarks:</h3>
        <ul className="text-sm text-muted-foreground text-left space-y-2">
          <li><span className="font-medium">Chrome:</span> Settings → Bookmarks → Bookmark manager → ⋮ → Export bookmarks</li>
          <li><span className="font-medium">Firefox:</span> Bookmarks → Manage bookmarks → Export bookmarks to HTML</li>
          <li><span className="font-medium">Safari:</span> File → Export bookmarks</li>
          <li><span className="font-medium">Edge:</span> Settings → General → Export favorites</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyState;
