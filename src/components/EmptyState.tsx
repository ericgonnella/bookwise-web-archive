import React from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onImportClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onImportClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Bookmark className="h-10 w-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold mb-3">No Bookmarks Yet</h2>
      
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <p className="text-muted-foreground max-w-lg">
            To get started, import your bookmarks from your browser by exporting them as HTML:
          </p>
          <div className="text-sm text-muted-foreground mt-2 space-y-2 max-w-md">
            <p><strong>Chrome:</strong> Menu → Bookmarks → Bookmark manager → ⋮ → Export bookmarks</p>
            <p><strong>Firefox:</strong> Menu → Bookmarks → Manage bookmarks → Import and Backup → Export bookmarks to HTML</p>
            <p><strong>Safari:</strong> File → Export Bookmarks</p>
            <p><strong>Edge:</strong> Settings → Favorites → ⋮ → Export favorites</p>
          </div>
        </div>
        
        <Button onClick={onImportClick}>
          Import Bookmarks
        </Button>
        
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
    </div>
  );
};

export default EmptyState;
