
import React, { useState } from "react";
import { Bookmark } from "../types";
import BookmarkCard from "./BookmarkCard";
import BulkToolbar from "./BulkToolbar";

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

  const handleBulkAction = (action: string) => {
    if (onBulkAction && selection.size > 0) {
      onBulkAction(action, Array.from(selection));
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
    </div>
  );
};

export default BookmarkGrid;
