
import React from "react";
import { Tag, FilterOptions, SortOption, SortDirection } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowUpDown,
  Search,
  X,
  Tag as TagIcon,
  CalendarDays, 
  Type, 
  ThumbsUp, 
  ArrowUp, 
  ArrowDown
} from "lucide-react";

interface FilterSidebarProps {
  tags: Tag[];
  filterOptions: FilterOptions;
  onUpdateFilters: (updates: Partial<FilterOptions>) => void;
  onToggleTag: (tag: string) => void;
  onClearFilters: () => void;
  onSort: (sortBy: SortOption, sortDirection: SortDirection) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  tags, 
  filterOptions, 
  onUpdateFilters, 
  onToggleTag,
  onClearFilters,
  onSort
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateFilters({ search: e.target.value });
  };
  
  const handleSortByChange = (value: string) => {
    onSort(value as SortOption, filterOptions.sortDirection);
  };
  
  const handleSortDirectionChange = (value: string) => {
    onSort(filterOptions.sortBy, value as SortDirection);
  };
  
  const hasActiveFilters = filterOptions.search !== "" || filterOptions.tags.length > 0;
  
  // Get sort icon based on current sort field
  const getSortIcon = () => {
    switch (filterOptions.sortBy) {
      case 'dateAdded':
        return <CalendarDays className="h-4 w-4" />;
      case 'title':
        return <Type className="h-4 w-4" />;
      case 'likes':
        return <ThumbsUp className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };
  
  // Get direction icon based on current sort direction
  const getDirectionIcon = () => {
    return filterOptions.sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />;
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Search</h3>
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search bookmarks..."
              value={filterOptions.search}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          {filterOptions.search && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onUpdateFilters({ search: "" })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <TagIcon className="h-4 w-4" /> Tags
          </h3>
          {filterOptions.tags.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onUpdateFilters({ tags: [] })}
              className="h-8 px-2"
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags available</p>
          ) : (
            tags.sort((a, b) => b.count - a.count).map((tag) => (
              <Badge
                key={tag.id}
                variant={filterOptions.tags.includes(tag.name) ? "default" : "outline"}
                className={`cursor-pointer ${filterOptions.tags.includes(tag.name) ? "" : "hover:bg-secondary"}`}
                onClick={() => onToggleTag(tag.name)}
              >
                {tag.name}
                <span className="ml-1 text-xs">
                  {tag.count}
                </span>
              </Badge>
            ))
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" /> Sort
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <Select value={filterOptions.sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                {getSortIcon()}
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="likes">Likes</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterOptions.sortDirection} onValueChange={handleSortDirectionChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                {getDirectionIcon()}
                <SelectValue placeholder="Direction" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {hasActiveFilters && (
        <Button onClick={onClearFilters} variant="outline" className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );
};

export default FilterSidebar;
