
import React from "react";
import { Bookmark } from "../types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Trash2, ExternalLink, Archive, Clock } from "lucide-react";
import { extractDomainFromUrl } from "@/lib/bookmarkParser";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onLike: (id: string, isLike: boolean) => void;
  onDelete: (id: string) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onArchive?: (id: string) => void;
  onRemind?: (id: string) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  onLike, 
  onDelete,
  isSelectable = false,
  isSelected = false,
  onSelect,
  onArchive,
  onRemind
}) => {
  const formattedDate = new Date(bookmark.dateAdded).toLocaleDateString();
  const domain = extractDomainFromUrl(bookmark.url);
  
  // Generate a color based on domain name for placeholder
  const getDomainColor = (domain: string) => {
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };
  
  const domainColor = getDomainColor(domain);
  const initials = domain.substring(0, 2).toUpperCase();
  
  const handleCardClick = () => {
    window.open(bookmark.url, "_blank");
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(bookmark.id, !isSelected);
    }
  };
  
  return (
    <Card 
      className={`bookmark-card h-full flex flex-col group relative cursor-pointer ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={isSelectable ? undefined : handleCardClick}
    >
      {isSelectable && (
        <div 
          className="absolute top-2 left-2 z-30 bg-background/80 rounded-md p-1"
          onClick={handleCheckboxClick}
        >
          <Checkbox 
            checked={isSelected} 
            className="data-[state=checked]:bg-primary"
          />
        </div>
      )}

      <div 
        className="relative aspect-video w-full overflow-hidden rounded-t-lg"
        onClick={isSelectable ? handleCardClick : undefined}
      >
        {bookmark.screenshot ? (
          <img 
            src={bookmark.screenshot} 
            alt={bookmark.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: domainColor }}
          >
            <span className="text-4xl font-bold text-white">{initials}</span>
          </div>
        )}
        
        <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center">
            {bookmark.favicon && (
              <img 
                src={bookmark.favicon} 
                alt="Favicon" 
                className="w-4 h-4 mr-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <span className="text-xs text-white truncate">{domain}</span>
          </div>
        </div>

        {bookmark.archived && (
          <div className="absolute bottom-0 left-0 w-full p-2 bg-muted/80">
            <div className="flex items-center justify-center text-xs">
              <Archive className="h-3 w-3 mr-1" />
              <span>Archived</span>
            </div>
          </div>
        )}

        {bookmark.remindAt && (
          <div className="absolute bottom-0 right-0 p-2 bg-primary/80 rounded-tl-md">
            <div className="flex items-center justify-center text-xs text-white">
              <Clock className="h-3 w-3 mr-1" />
              <span>{new Date(bookmark.remindAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
      
      <CardContent 
        className="flex-grow p-4 relative z-20"
        onClick={isSelectable ? handleCardClick : undefined}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-lg leading-tight line-clamp-2">{bookmark.title}</h3>
        </div>
        
        {bookmark.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {bookmark.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {bookmark.tags.map((tag) => (
            <Badge key={tag} variant="outline" className={`tag tag-${tag.toLowerCase()}`}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-4 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{formattedDate}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike(bookmark.id, true);
                  }}
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {bookmark.likes > 0 && <span className="ml-1 text-xs">{bookmark.likes}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Like</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike(bookmark.id, false);
                  }}
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {bookmark.dislikes > 0 && <span className="ml-1 text-xs">{bookmark.dislikes}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dislike</TooltipContent>
            </Tooltip>

            {onArchive && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(bookmark.id);
                    }}
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive</TooltipContent>
              </Tooltip>
            )}

            {onRemind && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemind(bookmark.id);
                    }}
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remind me</TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(bookmark.id);
                  }}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookmarkCard;
