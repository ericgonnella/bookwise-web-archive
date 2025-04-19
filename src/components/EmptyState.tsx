
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
        <p className="text-muted-foreground max-w-lg">
          To get started, import your bookmarks from your browser by exporting them as HTML:
        </p>
        
        <div className="text-sm text-muted-foreground mt-2 space-y-2 max-w-md mx-auto">
          <p><strong>Chrome:</strong> Menu → Bookmarks → Bookmark manager → ⋮ → Export bookmarks</p>
          <p><strong>Firefox:</strong> Menu → Bookmarks → Manage bookmarks → Import and Backup → Export bookmarks to HTML</p>
          <p><strong>Safari:</strong> File → Export Bookmarks</p>
          <p><strong>Edge:</strong> Settings → Favorites → ⋮ → Export favorites</p>
        </div>
        
        <Button onClick={onImportClick} size="lg" className="mt-4">
          Import Bookmarks
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
