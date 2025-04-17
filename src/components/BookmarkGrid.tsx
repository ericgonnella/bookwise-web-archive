
import React from "react";
import { Bookmark } from "../types";
import BookmarkCard from "./BookmarkCard";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onLike: (id: string, isLike: boolean) => void;
  onDelete: (id: string) => void;
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({ bookmarks, onLike, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onLike={onLike}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BookmarkGrid;
