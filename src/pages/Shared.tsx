
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bookmark } from "../types";
import Layout from "@/components/Layout";
import BookmarkGrid from "@/components/BookmarkGrid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const SharedPage = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const loadSharedBookmarks = () => {
      try {
        const params = new URLSearchParams(location.search);
        const bookmarkData = params.get("data");
        
        if (!bookmarkData) {
          setError("No bookmark data found in the URL");
          setLoading(false);
          return;
        }
        
        const decodedData = decodeURIComponent(bookmarkData);
        const parsedBookmarks: Bookmark[] = JSON.parse(decodedData);
        
        // Convert date strings back to Date objects
        const processedBookmarks = parsedBookmarks.map(bookmark => ({
          ...bookmark,
          dateAdded: new Date(bookmark.dateAdded),
          lastViewedAt: bookmark.lastViewedAt ? new Date(bookmark.lastViewedAt) : undefined,
          remindAt: bookmark.remindAt ? new Date(bookmark.remindAt) : undefined
        }));
        
        setBookmarks(processedBookmarks);
        setLoading(false);
      } catch (error) {
        console.error("Error loading shared bookmarks:", error);
        setError("Failed to load shared bookmarks");
        setLoading(false);
      }
    };
    
    loadSharedBookmarks();
  }, [location]);

  const handleImport = () => {
    // In a real app, this would integrate with the bookmark store
    // For now, we'll just show a toast notification
    toast({
      title: "Import Successful",
      description: `Imported ${bookmarks.length} bookmarks to your collection`,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Shared Collection</h2>
            <p className="mb-6">{error}</p>
            <Link to="/">
              <Button variant="default">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold">Shared Bookmarks</h2>
            <p className="text-sm text-muted-foreground">
              {bookmarks.length} {bookmarks.length === 1 ? "bookmark" : "bookmarks"} shared with you
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleImport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Import All
            </Button>
            
            <Button 
              variant="default"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Copy Link
            </Button>
            
            <Link to="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
        
        <BookmarkGrid 
          bookmarks={bookmarks}
          onLike={() => {}} // No-op for shared view
          onDelete={() => {}} // No-op for shared view
        />
      </div>
    </Layout>
  );
};

export default SharedPage;
