
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, 
  Square, 
  Tag, 
  Trash2, 
  Download, 
  Archive, 
  X,
  Clock 
} from "lucide-react";

interface BulkToolbarProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkAction: (action: string) => void;
  onClose: () => void;
}

const BulkToolbar: React.FC<BulkToolbarProps> = ({ 
  selectedCount, 
  onSelectAll, 
  onDeselectAll, 
  onBulkAction,
  onClose 
}) => {
  return (
    <div className="sticky top-0 z-30 bg-background border rounded-lg p-2 mb-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={selectedCount > 0 ? onDeselectAll : onSelectAll}
        >
          {selectedCount > 0 ? (
            <><CheckSquare className="h-4 w-4 mr-2" /> Deselect All</>
          ) : (
            <><Square className="h-4 w-4 mr-2" /> Select All</>
          )}
        </Button>

        <div className="text-sm font-medium">
          {selectedCount} selected
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => onBulkAction('tag')}
          disabled={selectedCount === 0}
        >
          <Tag className="h-4 w-4 mr-1" /> Tag
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => onBulkAction('archive')}
          disabled={selectedCount === 0}
        >
          <Archive className="h-4 w-4 mr-1" /> Archive
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => onBulkAction('remind')}
          disabled={selectedCount === 0}
        >
          <Clock className="h-4 w-4 mr-1" /> Remind
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => onBulkAction('export')}
          disabled={selectedCount === 0}
        >
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-destructive hover:bg-destructive/10"
          onClick={() => onBulkAction('delete')}
          disabled={selectedCount === 0}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BulkToolbar;
