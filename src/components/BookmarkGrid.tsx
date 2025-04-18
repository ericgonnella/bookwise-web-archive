
import React, { useState } from "react";
import { Bookmark } from "../types";
import BookmarkCard from "./BookmarkCard";
import BulkToolbar from "./BulkToolbar";
import { exportToHTML } from "../lib/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2 } from "lucide-react";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onLike: (id: string, isLike: boolean) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRemind?: (id: string) => void;
  onBulkAction?: (action: string, ids: string[]) => void;
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({ 
  bookmarks, 
  onLike, 
  onDelete,
  onArchive,
  onRemind,
  onBulkAction
}) => {
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareURL, setShareURL] = useState("");
  const { toast } = useToast();

  const toggleSelection = (id: string, selected: boolean) => {
    const newSelection = new Set(selection);
    if (selected) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelection(newSelection);

    // If nothing is selected, exit selection mode
    if (newSelection.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const handleSelectAll = () => {
    const allIds = bookmarks.map(b => b.id);
    setSelection(new Set(allIds));
  };

  const handleDeselectAll = () => {
    setSelection(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkAction = async (action: string) => {
    if (selection.size > 0) {
      const selectedIds = Array.from(selection);
      const selectedBookmarks = bookmarks.filter(b => selection.has(b.id));
      
      switch (action) {
        case 'export':
          try {
            const htmlContent = exportToHTML(selectedBookmarks);
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bookmarks-export.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast({
              title: "Export Successful",
              description: `Exported ${selectedBookmarks.length} bookmarks as HTML`,
            });
          } catch (error) {
            console.error("Export error:", error);
            toast({
              title: "Export Failed",
              description: "There was an error exporting your bookmarks",
              variant: "destructive"
            });
          }
          break;
          
        case 'share':
          // Generate a shareable URL (in a real app, this would create a server-side resource)
          const bookmarkData = encodeURIComponent(JSON.stringify(selectedBookmarks));
          const shareableURL = `${window.location.origin}/shared?data=${bookmarkData}`;
          setShareURL(shareableURL);
          setShareDialogOpen(true);
          break;
          
        default:
          // Handle other bulk actions
          if (onBulkAction) {
            onBulkAction(action, selectedIds);
          }
      }
      
      // Clear selection after action
      setSelection(new Set());
      setIsSelectionMode(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setSelection(new Set());
    }
  };

  const copyShareURL = () => {
    navigator.clipboard.writeText(shareURL);
    toast({
      title: "URL Copied",
      description: "Shareable URL copied to clipboard",
    });
  };

  return (
    <div>
      {isSelectionMode && (
        <BulkToolbar 
          selectedCount={selection.size}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBulkAction={handleBulkAction}
          onClose={toggleSelectionMode}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onLike={onLike}
            onDelete={onDelete}
            onArchive={onArchive}
            onRemind={onRemind}
            isSelectable={isSelectionMode}
            isSelected={selection.has(bookmark.id)}
            onSelect={toggleSelection}
          />
        ))}
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Bookmarks Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="share-url">Shareable URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="share-url" 
                  value={shareURL} 
                  readOnly
                  className="flex-grow"
                />
                <Button onClick={copyShareURL}>Copy</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with this URL will be able to view and import these bookmarks.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Export Options</Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleBulkAction('export')}>
                  HTML
                </Button>
                <Button variant="outline" onClick={() => {/* OPML export logic */}}>
                  OPML
                </Button>
                <Button variant="outline" onClick={() => {/* JSON export logic */}}>
                  JSON
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookmarkGrid;
