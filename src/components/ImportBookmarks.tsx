
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, CheckCircle2, AlertCircle, Sparkles, Loader2, Info, FilterIcon } from "lucide-react";
import { parseBookmarksHtml } from "../lib/bookmarkParser";
import { Progress } from "@/components/ui/progress";
import { Bookmark } from "../types";
import { useToast } from "@/hooks/use-toast";
import { enhanceBookmarksWithAI } from "@/services/aiService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ImportBookmarksProps {
  onImport: (bookmarks: Bookmark[]) => void;
  existingBookmarks?: Bookmark[];
}

const ImportBookmarks: React.FC<ImportBookmarksProps> = ({ onImport, existingBookmarks = [] }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);
  const [autoDedupe, setAutoDedupe] = useState(true);
  const [mergeMetadata, setMergeMetadata] = useState(true);
  const [duplicatesFound, setDuplicatesFound] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showImport, setShowImport] = useState(true);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const normalizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      let normalizedUrl = urlObj.origin + urlObj.pathname.replace(/\/$/, '');
      
      const params = new URLSearchParams(urlObj.search);
      const essentialParams = new URLSearchParams();
      
      params.forEach((value, key) => {
        if (!key.startsWith('utm_') && key !== 'source' && key !== 'ref') {
          essentialParams.append(key, value);
        }
      });
      
      const essentialSearch = essentialParams.toString();
      if (essentialSearch) {
        normalizedUrl += '?' + essentialSearch;
      }
      
      if (urlObj.hash) {
        normalizedUrl += urlObj.hash;
      }
      
      return normalizedUrl.toLowerCase();
    } catch (error) {
      return url.toLowerCase();
    }
  };

  const cleanupTitle = (title: string): string => {
    return title
      .replace(/\s[|\-–—]\s.*$/, '')
      .replace(/\s*\(.*?\)\s*$/, '')
      .trim();
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setIsSuccess(false);
    setProgress(0);
    setDuplicatesFound(0);

    try {
      if (file.type !== "text/html" && !file.name.endsWith(".html")) {
        throw new Error("Please upload an HTML file");
      }

      const content = await file.text();
      let parsedBookmarks = parseBookmarksHtml(content);

      if (parsedBookmarks.length === 0) {
        throw new Error("No bookmarks found in the HTML file");
      }

      parsedBookmarks = parsedBookmarks.map(bookmark => ({
        ...bookmark,
        title: cleanupTitle(bookmark.title)
      }));
      
      if (autoDedupe && existingBookmarks.length > 0) {
        const normalizedExistingUrls = new Map<string, Bookmark>();
        existingBookmarks.forEach(bookmark => {
          normalizedExistingUrls.set(normalizeUrl(bookmark.url), bookmark);
        });
        
        const uniqueBookmarks: Bookmark[] = [];
        const dupes: Bookmark[] = [];
        
        parsedBookmarks.forEach(newBookmark => {
          const normalizedUrl = normalizeUrl(newBookmark.url);
          const existingBookmark = normalizedExistingUrls.get(normalizedUrl);
          
          if (existingBookmark) {
            dupes.push(newBookmark);
            
            if (mergeMetadata) {
              const combinedTags = [...new Set([
                ...existingBookmark.tags, 
                ...newBookmark.tags
              ])];
              
              const latestDate = new Date(newBookmark.dateAdded) > new Date(existingBookmark.dateAdded) 
                ? newBookmark.dateAdded 
                : existingBookmark.dateAdded;
              
              Object.assign(existingBookmark, {
                tags: combinedTags,
                dateAdded: latestDate,
                description: existingBookmark.description || newBookmark.description
              });
            }
          } else {
            uniqueBookmarks.push(newBookmark);
          }
        });
        
        setDuplicatesFound(dupes.length);
        parsedBookmarks = uniqueBookmarks;
        
        if (dupes.length > 0) {
          toast({
            title: `${dupes.length} duplicate bookmarks detected`,
            description: mergeMetadata 
              ? "Metadata was merged with existing bookmarks" 
              : "Duplicates were skipped",
          });
        }
      }

      if (useAI && parsedBookmarks.length > 0) {
        setIsAiProcessing(true);
        toast({
          title: "AI Processing",
          description: `Processing ${parsedBookmarks.length} bookmarks in batches...`,
        });
        
        try {
          parsedBookmarks = await enhanceBookmarksWithAI(
            parsedBookmarks,
            5,
            (processed, total) => {
              const progressPercent = (processed / total) * 100;
              setProgress(progressPercent);
            }
          );
          
          toast({
            title: "AI Analysis Complete",
            description: `Enhanced ${parsedBookmarks.length} bookmarks with AI descriptions and categories`,
          });
        } catch (aiError) {
          console.error("AI processing error:", aiError);
          toast({
            variant: "destructive",
            title: "AI Processing Failed",
            description: "Could not enhance bookmarks with AI. Using basic categorization instead.",
          });
        } finally {
          setIsAiProcessing(false);
        }
      }

      if (parsedBookmarks.length > 0) {
        onImport(parsedBookmarks);
        setIsSuccess(true);
        toast({
          title: "Import successful",
          description: `${parsedBookmarks.length} bookmarks imported${
            duplicatesFound > 0 ? `, ${duplicatesFound} duplicates ${mergeMetadata ? 'merged' : 'skipped'}` : ''
          }`,
        });
      } else {
        toast({
          variant: "default",
          title: "No new bookmarks",
          description: "All bookmarks already exist in your collection."
        });
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import bookmarks");
      toast({
        variant: "destructive",
        title: "Import failed",
        description: err instanceof Error ? err.message : "Failed to import bookmarks",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess) {
      timer = setTimeout(() => {
        setShowImport(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess]);

  if (!showImport) return null;

  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-end gap-2">
                <Switch 
                  id="use-ai" 
                  checked={useAI} 
                  onCheckedChange={setUseAI}
                />
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label htmlFor="use-ai" className="flex items-center gap-1 cursor-pointer">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      AI-Enhanced Import
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      Uses AI to automatically generate descriptions, categorize bookmarks, and extract key information from each website.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Switch 
                  id="auto-dedupe" 
                  checked={autoDedupe} 
                  onCheckedChange={setAutoDedupe}
                />
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Label htmlFor="auto-dedupe" className="flex items-center gap-1 cursor-pointer">
                      <FilterIcon className="h-4 w-4 text-blue-500" />
                      Smart Deduplication
                    </Label>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      Automatically detects and handles duplicate bookmarks by comparing URLs and normalizing them to prevent duplicates.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>

              {autoDedupe && (
                <div className="flex items-center justify-end gap-2">
                  <Switch 
                    id="merge-metadata" 
                    checked={mergeMetadata} 
                    onCheckedChange={setMergeMetadata}
                  />
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Label htmlFor="merge-metadata" className="text-sm text-muted-foreground cursor-pointer">
                        Merge tags & metadata
                      </Label>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">
                        When duplicates are found, combine tags and keep the most recent metadata instead of discarding the duplicate entirely.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              )}
            </div>
            
            {useAI && (
              <Alert variant="default" className="bg-muted/50">
                <Info className="h-4 w-4" />
                <AlertTitle>About Website Screenshots</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  Some websites may block screenshot capture due to security settings. 
                  In these cases, a placeholder image will be used instead.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div
            className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            } ${isSuccess ? "bg-green-50 border-green-300" : ""} ${
              error ? "bg-destructive/10 border-destructive" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".html"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              {isSuccess ? (
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              ) : error ? (
                <AlertCircle className="h-12 w-12 text-destructive" />
              ) : isAiProcessing ? (
                <div className="text-primary flex flex-col items-center">
                  <Sparkles className="h-12 w-12 mb-2 animate-pulse" />
                  <p>AI is analyzing your bookmarks...</p>
                  <div className="w-full max-w-xs mt-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round(progress)}% complete
                    </p>
                  </div>
                </div>
              ) : (
                <Upload className="h-12 w-12 text-primary/70" />
              )}

              <div className="space-y-2">
                <h3 className="font-medium text-lg">
                  {isSuccess
                    ? "Import Successful"
                    : error
                    ? "Import Failed"
                    : isAiProcessing
                    ? "AI Processing"
                    : "Import Bookmarks"}
                </h3>
                <p className="text-muted-foreground">
                  {isSuccess
                    ? "Your bookmarks have been imported"
                    : error
                    ? error
                    : isAiProcessing
                    ? "Adding descriptions and intelligent categorization"
                    : useAI
                    ? "Drag and drop your bookmarks.html file here for AI-enhanced import"
                    : "Drag and drop your bookmarks.html file here"}
                </p>
              </div>

              {!isSuccess && !isProcessing && !isAiProcessing && (
                <Button
                  onClick={handleButtonClick}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <FileUp className="h-4 w-4" />
                  Select File
                </Button>
              )}

              {isProcessing && !isAiProcessing && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {useAI 
              ? "AI will analyze your bookmarks in batches to provide descriptions and better categorization" 
              : autoDedupe
              ? "Smart deduplication will prevent duplicate bookmarks and normalize URLs"
              : "You can export bookmarks from Chrome, Firefox, Safari, or Edge"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportBookmarks;
