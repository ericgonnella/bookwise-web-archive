
import React, { useState, useRef } from "react";
import Layout from "@/components/Layout";
import BookmarkGrid from "@/components/BookmarkGrid";
import BookmarkList from "@/components/BookmarkList";
import ViewToggle from "@/components/ViewToggle";
import FilterSidebar from "@/components/FilterSidebar";
import ImportBookmarks from "@/components/ImportBookmarks";
import EmptyState from "@/components/EmptyState";
import useBookmarks from "@/hooks/useBookmarks";
import { ViewMode } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Import, SlidersHorizontal } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

const Index = () => {
  // Initialize view mode
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  // Initialize import dialog state
  const [showImport, setShowImport] = useState(false);
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Import section ref for scrolling
  const importSectionRef = useRef<HTMLDivElement>(null);
  
  // Get bookmarks and related functions from the custom hook
  const {
    bookmarks,
    allBookmarks,
    filterOptions,
    allTags,
    addBookmarks,
    likeBookmark,
    deleteBookmark,
    updateFilters,
    toggleTagFilter,
    clearFilters,
    setSortOptions
  } = useBookmarks();
  
  // Scroll to import section
  const scrollToImport = () => {
    setShowImport(true);
    setTimeout(() => {
      importSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  
  // Toggle view mode between grid and list
  const handleToggleView = (mode: ViewMode) => {
    setViewMode(mode);
  };
  
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <Layout>
      <div className="container py-6">
        {/* Top bar with controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">Your Bookmarks</h2>
            <span className="text-sm text-muted-foreground">
              {bookmarks.length} {bookmarks.length === 1 ? "bookmark" : "bookmarks"}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <div className="block md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="p-6 max-w-sm mx-auto">
                    <FilterSidebar
                      tags={allTags}
                      filterOptions={filterOptions}
                      onUpdateFilters={updateFilters}
                      onToggleTag={toggleTagFilter}
                      onClearFilters={clearFilters}
                      onSort={setSortOptions}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
            
            <ViewToggle viewMode={viewMode} onToggle={handleToggleView} />
            
            <Button 
              onClick={() => setShowImport(!showImport)}
              variant="default" 
              className="flex items-center gap-2"
            >
              <Import className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
        
        {/* Import section (conditionally rendered) */}
        {showImport && (
          <div ref={importSectionRef}>
            <ImportBookmarks onImport={addBookmarks} />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar (hidden on mobile) */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                tags={allTags}
                filterOptions={filterOptions}
                onUpdateFilters={updateFilters}
                onToggleTag={toggleTagFilter}
                onClearFilters={clearFilters}
                onSort={setSortOptions}
              />
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-grow">
            {allBookmarks.length === 0 ? (
              <EmptyState onImportClick={scrollToImport} />
            ) : bookmarks.length === 0 ? (
              <div className="bg-muted/50 p-8 rounded-lg text-center">
                <p className="text-lg mb-4">No bookmarks match your filters</p>
                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
              </div>
            ) : viewMode === "grid" ? (
              <BookmarkGrid 
                bookmarks={bookmarks} 
                onLike={likeBookmark} 
                onDelete={deleteBookmark} 
              />
            ) : (
              <BookmarkList 
                bookmarks={bookmarks} 
                onLike={likeBookmark} 
                onDelete={deleteBookmark} 
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
