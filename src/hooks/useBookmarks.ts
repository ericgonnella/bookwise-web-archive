
import { useState, useEffect, useMemo } from "react";
import { Bookmark, FilterOptions, SortOption, SortDirection, Tag } from "../types";
import { getSampleBookmarks } from "../lib/bookmarkParser";

const useBookmarks = () => {
  // State for bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  // State for filters and sorting
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    tags: [],
    sortBy: "dateAdded",
    sortDirection: "desc"
  });

  // Load sample bookmarks on mount
  useEffect(() => {
    const sampleBookmarks = getSampleBookmarks();
    setBookmarks(sampleBookmarks);
  }, []);

  // Add new bookmarks
  const addBookmarks = (newBookmarks: Bookmark[]) => {
    setBookmarks(prevBookmarks => {
      // Create a map of existing bookmarks by URL for quick lookup
      const existingUrlMap = new Map(prevBookmarks.map(b => [b.url, b]));
      
      // Process each new bookmark
      const mergedBookmarks = [...prevBookmarks];
      
      for (const newBookmark of newBookmarks) {
        const existing = existingUrlMap.get(newBookmark.url);
        
        if (!existing) {
          // If bookmark doesn't exist, add it
          mergedBookmarks.push(newBookmark);
        } else if (newBookmark.dateAdded > existing.dateAdded) {
          // If bookmark exists but new one is more recent, replace it
          const index = mergedBookmarks.findIndex(b => b.id === existing.id);
          mergedBookmarks[index] = {
            ...existing,
            ...newBookmark,
            id: existing.id, // Keep the original ID
            likes: existing.likes, // Preserve user data
            dislikes: existing.dislikes
          };
        }
      }
      
      return mergedBookmarks;
    });
  };

  // Update a bookmark
  const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === id ? { ...bookmark, ...updates } : bookmark
      )
    );
  };

  // Delete a bookmark
  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  // Like/dislike a bookmark
  const likeBookmark = (id: string, isLike: boolean) => {
    setBookmarks(prev => 
      prev.map(bookmark => {
        if (bookmark.id === id) {
          if (isLike) {
            return { ...bookmark, likes: bookmark.likes + 1 };
          } else {
            return { ...bookmark, dislikes: bookmark.dislikes + 1 };
          }
        }
        return bookmark;
      })
    );
  };

  // Update filter options
  const updateFilters = (updates: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...updates }));
  };

  // Toggle a tag filter
  const toggleTagFilter = (tag: string) => {
    setFilterOptions(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterOptions({
      search: "",
      tags: [],
      sortBy: "dateAdded",
      sortDirection: "desc"
    });
  };

  // Set sort options
  const setSortOptions = (sortBy: SortOption, sortDirection: SortDirection) => {
    setFilterOptions(prev => ({ ...prev, sortBy, sortDirection }));
  };

  // Get all unique tags from bookmarks with counts
  const allTags = useMemo((): Tag[] => {
    const tagMap = new Map<string, number>();
    
    bookmarks.forEach(bookmark => {
      bookmark.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagMap.entries()).map(([name, count]) => ({
      id: name,
      name,
      count
    }));
  }, [bookmarks]);

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = useMemo(() => {
    let result = [...bookmarks];
    
    // Apply search filter
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      result = result.filter(
        b => b.title.toLowerCase().includes(searchLower) || 
             b.url.toLowerCase().includes(searchLower) ||
             b.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply tag filter
    if (filterOptions.tags.length > 0) {
      result = result.filter(
        b => filterOptions.tags.some(tag => b.tags.includes(tag))
      );
    }
    
    // Sort bookmarks
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filterOptions.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dateAdded':
          comparison = a.dateAdded.getTime() - b.dateAdded.getTime();
          break;
        case 'likes':
          comparison = a.likes - b.likes;
          break;
      }
      
      return filterOptions.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [bookmarks, filterOptions]);

  return {
    bookmarks: filteredAndSortedBookmarks,
    allBookmarks: bookmarks,
    filterOptions,
    allTags,
    addBookmarks,
    updateBookmark,
    deleteBookmark,
    likeBookmark,
    updateFilters,
    toggleTagFilter,
    clearFilters,
    setSortOptions
  };
};

export default useBookmarks;
