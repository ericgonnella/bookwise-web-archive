
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, CheckCircle2, AlertCircle, Sparkles, Loader2, Info } from "lucide-react";
import { parseBookmarksHtml } from "../lib/bookmarkParser";
import { Progress } from "@/components/ui/progress";
import { Bookmark } from "../types";
import { useToast } from "@/hooks/use-toast";
import { enhanceBookmarksWithAI } from "@/services/aiService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportBookmarksProps {
  onImport: (bookmarks: Bookmark[]) => void;
}

const ImportBookmarks: React.FC<ImportBookmarksProps> = ({ onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);
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

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setIsSuccess(false);
    setProgress(0);

    try {
      if (file.type !== "text/html" && !file.name.endsWith(".html")) {
        throw new Error("Please upload an HTML file");
      }

      const content = await file.text();
      let parsedBookmarks = parseBookmarksHtml(content);

      if (parsedBookmarks.length === 0) {
        throw new Error("No bookmarks found in the HTML file");
      }

      // Use AI to enhance bookmarks if enabled
      if (useAI) {
        setIsAiProcessing(true);
        toast({
          title: "AI Processing",
          description: `Processing ${parsedBookmarks.length} bookmarks in batches...`,
        });
        
        try {
          parsedBookmarks = await enhanceBookmarksWithAI(
            parsedBookmarks,
            5, // Process 5 bookmarks at a time
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
          // Continue with the basic parsed bookmarks even if AI enhancement fails
        } finally {
          setIsAiProcessing(false);
        }
      }

      // Always import the bookmarks, even if AI processing failed
      onImport(parsedBookmarks);
      setIsSuccess(true);
      toast({
        title: "Import successful",
        description: `${parsedBookmarks.length} bookmarks imported`,
      });
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
      // Delay hiding the import section to allow user to see success message
      timer = setTimeout(() => {
        setShowImport(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess]);

  // Don't render the component if showImport is false
  if (!showImport) return null;

  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-end gap-2">
              <Switch 
                id="use-ai" 
                checked={useAI} 
                onCheckedChange={setUseAI} 
              />
              <Label htmlFor="use-ai" className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI-Enhanced Import
              </Label>
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
              : "You can export bookmarks from Chrome, Firefox, Safari, or Edge"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportBookmarks;
