
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, CheckCircle2, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { parseBookmarksHtml } from "../lib/bookmarkParser";
import { Bookmark } from "../types";
import { useToast } from "@/hooks/use-toast";
import { enhanceBookmarksWithAI } from "@/services/aiService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ImportBookmarksProps {
  onImport: (bookmarks: Bookmark[]) => void;
}

const ImportBookmarks: React.FC<ImportBookmarksProps> = ({ onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
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
          description: `Analyzing ${parsedBookmarks.length} bookmarks with AI...`,
        });
        
        try {
          parsedBookmarks = await enhanceBookmarksWithAI(parsedBookmarks);
          toast({
            title: "AI Analysis Complete",
            description: `Enhanced ${parsedBookmarks.length} bookmarks with AI descriptions and categories`,
          });
        } catch (aiError) {
          toast({
            variant: "destructive",
            title: "AI Processing Failed",
            description: "Could not enhance bookmarks with AI. Using basic categorization instead.",
          });
          console.error("AI processing error:", aiError);
        } finally {
          setIsAiProcessing(false);
        }
      }

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
      timer = setTimeout(() => {
        setIsSuccess(false);
        setShowImport(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-end mb-2 gap-2">
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
      
      <div
        className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        } ${isSuccess ? "bg-green-50 border-green-300" : ""} ${
          error ? "bg-red-50 border-red-300" : ""
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
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : isAiProcessing ? (
            <div className="text-primary animate-pulse flex flex-col items-center">
              <Sparkles className="h-12 w-12 mb-2" />
              <p>AI is analyzing your bookmarks...</p>
              <div className="mt-2">
                <Loader2 className="h-6 w-6 animate-spin" />
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
            <div className="animate-pulse text-primary">Processing...</div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {useAI 
          ? "AI will analyze your bookmarks to provide descriptions and better categorization" 
          : "You can export bookmarks from Chrome, Firefox, Safari, or Edge"}
      </p>
    </div>
  );
};

export default ImportBookmarks;
