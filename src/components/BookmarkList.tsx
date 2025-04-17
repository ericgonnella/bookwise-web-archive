
import React from "react";
import { Bookmark } from "../types";
import { ThumbsUp, ThumbsDown, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractDomainFromUrl } from "@/lib/bookmarkParser";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onLike: (id: string, isLike: boolean) => void;
  onDelete: (id: string) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onLike, onDelete }) => {
  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => {
        const domain = extractDomainFromUrl(bookmark.url);
        const formattedDate = new Date(bookmark.dateAdded).toLocaleDateString();
        
        return (
          <div 
            key={bookmark.id} 
            className="flex items-start p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all"
          >
            {/* Favicon or placeholder */}
            <div className="mr-4 mt-1">
              {bookmark.favicon ? (
                <img 
                  src={bookmark.favicon} 
                  alt="Site favicon" 
                  className="w-6 h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-6 h-6 bg-primary/20 flex items-center justify-center rounded text-primary text-xs font-bold">
                  {domain.substring(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-grow min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="font-medium">{bookmark.title}</h3>
                <span className="text-xs text-muted-foreground">{domain}</span>
              </div>
              
              {bookmark.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {bookmark.description}
                </p>
              )}
              
              <div className="flex items-center flex-wrap gap-2 mt-2">
                <div className="flex flex-wrap gap-1">
                  {bookmark.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className={`tag tag-${tag.toLowerCase()}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formattedDate}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 ml-4">
              <Button variant="ghost" size="icon" onClick={() => onLike(bookmark.id, true)} className="h-8 w-8">
                <ThumbsUp className="h-4 w-4" />
                {bookmark.likes > 0 && <span className="ml-1 text-xs">{bookmark.likes}</span>}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => onLike(bookmark.id, false)} className="h-8 w-8">
                <ThumbsDown className="h-4 w-4" />
                {bookmark.dislikes > 0 && <span className="ml-1 text-xs">{bookmark.dislikes}</span>}
              </Button>
              
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(bookmark.url, "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(bookmark.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookmarkList;
