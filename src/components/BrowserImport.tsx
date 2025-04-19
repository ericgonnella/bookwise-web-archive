
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chrome, Globe, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { 
  importFromBrowser,
  requestBrowserPermissions, 
  getBrowserType,
  isChromeAvailable,
  isFirefoxAvailable
} from "@/services/browserImport.service";
import { useToast } from "@/hooks/use-toast";
import { Bookmark } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface BrowserImportProps {
  onImport: (bookmarks: Bookmark[]) => void;
}

const BrowserImport: React.FC<BrowserImportProps> = ({ onImport }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const browserType = getBrowserType();

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      const permissionsGranted = await requestBrowserPermissions();
      
      if (!permissionsGranted) {
        throw new Error("Permission to access bookmarks was denied");
      }
      
      setProgress(30);
      
      const bookmarks = await importFromBrowser();
      
      setProgress(70);
      
      if (bookmarks.length === 0) {
        toast({
          title: "No bookmarks found",
          description: "No bookmarks could be imported from your browser",
        });
        setError("No bookmarks found");
      } else {
        toast({
          title: "Import successful",
          description: `Successfully imported ${bookmarks.length} bookmarks from your browser`,
        });
        setProgress(100);
        setSuccess(true);
        onImport(bookmarks);
      }
    } catch (err) {
      console.error("Browser import error:", err);
      setError(err instanceof Error ? err.message : "Failed to import bookmarks");
      toast({
        variant: "destructive",
        title: "Import failed",
        description: err instanceof Error ? err.message : "Failed to import bookmarks",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isExtensionAvailable = isChromeAvailable() || isFirefoxAvailable();

  if (!isExtensionAvailable) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Browser Sync</CardTitle>
          <CardDescription>
            Direct browser import requires our extension
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm">
            To import bookmarks directly from your browser, you'll need to:
          </p>
          <ol className="list-decimal list-inside text-sm space-y-2 mb-4">
            <li>Install BookWise extension for your browser</li>
            <li>Grant permission to access your bookmarks</li>
            <li>Click the import button to sync</li>
          </ol>
          <div className="flex space-x-2">
            {browserType === 'chrome' || browserType === 'unknown' ? (
              <Button variant="outline" className="flex items-center gap-2" disabled>
                <Chrome className="h-4 w-4" />
                Chrome Extension
              </Button>
            ) : null}
            {browserType === 'firefox' || browserType === 'unknown' ? (
              <Button variant="outline" className="flex items-center gap-2" disabled>
                <Globe className="h-4 w-4" />
                {browserType === 'firefox' ? 'Firefox' : 'Browser'} Add-on
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Browser Sync</CardTitle>
        <CardDescription>
          Import bookmarks directly from your browser
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {success ? (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span>Import successful</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : null}
          
          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Importing bookmarks... {progress}%
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleImport} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : browserType === 'chrome' ? (
              <Chrome className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            {isLoading ? "Importing..." : `Import from ${browserType === 'chrome' ? 'Chrome' : 'Browser'}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrowserImport;
