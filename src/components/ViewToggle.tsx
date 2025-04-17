
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { ViewMode } from "../types";

interface ViewToggleProps {
  viewMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onToggle }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="icon"
        onClick={() => onToggle("grid")}
        className="h-9 w-9"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="icon"
        onClick={() => onToggle("list")}
        className="h-9 w-9"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewToggle;
