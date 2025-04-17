
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, CheckCircle2, AlertCircle } from "lucide-react";
import { parseBookmarksHtml } from "../lib/bookmarkParser";
import { Bookmark } from "../types";
import { useToast } from "@/hooks/use-toast";

interface ImportBookmarksProps {
  onImport: (bookmarks: Bookmark[]) => void;
}

const ImportBookmarks: React.FC<ImportBookmarksProps> = ({ onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      const parsedBookmarks = parseBookmarksHtml(content);

      if (parsedBookmarks.length === 0) {
        throw new Error("No bookmarks found in the HTML file");
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
      // Reset success state after 3 seconds
      if (isSuccess) {
        setTimeout(() => setIsSuccess(false), 3000);
      }
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

  return (
    <div className="mb-6">
      <div
        className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
          isDragging ? "drag-active" : "border-border"
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
          ) : (
            <Upload className="h-12 w-12 text-primary/70" />
          )}

          <div className="space-y-2">
            <h3 className="font-medium text-lg">
              {isSuccess
                ? "Import Successful"
                : error
                ? "Import Failed"
                : "Import Bookmarks"}
            </h3>
            <p className="text-muted-foreground">
              {isSuccess
                ? "Your bookmarks have been imported"
                : error
                ? error
                : "Drag and drop your bookmarks.html file here"}
            </p>
          </div>

          {!isSuccess && !isProcessing && (
            <Button
              onClick={handleButtonClick}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileUp className="h-4 w-4" />
              Select File
            </Button>
          )}

          {isProcessing && (
            <div className="animate-pulse text-primary">Processing...</div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        You can export bookmarks from Chrome, Firefox, Safari, or Edge
      </p>
    </div>
  );
};

export default ImportBookmarks;
