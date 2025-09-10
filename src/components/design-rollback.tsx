import { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Clock, RotateCcw, Eye, Check } from "lucide-react";
import * as fabric from 'fabric';

interface DesignHistoryItem {
  id: string;
  fabricJSON: unknown;
  prompt: string;
  timestamp: number;
  preview?: string;
}

interface DesignRollbackProps {
  designHistory: DesignHistoryItem[];
  onRollback: (fabricJSON: unknown) => void;
  onPreview: (fabricJSON: unknown) => void;
  onClose: () => void;
}

export function DesignRollback({ 
  designHistory, 
  onRollback, 
  onPreview, 
  onClose 
}: DesignRollbackProps) {
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const truncatePrompt = (prompt: string, maxLength: number = 50) => {
    return prompt.length > maxLength ? `${prompt.substring(0, maxLength)}...` : prompt;
  };

  const handlePreview = (item: DesignHistoryItem) => {
    setPreviewingId(item.id);
    onPreview(item.fabricJSON);
  };

  const handleRollback = (item: DesignHistoryItem) => {
    onRollback(item.fabricJSON);
    onClose();
  };

  if (designHistory.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No design history yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Accepted designs will appear here for rollback
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Design History
        </h3>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          ×
        </Button>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-2">
          {designHistory.map((item, index) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-colors ${
                previewingId === item.id
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      #{designHistory.length - index}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">
                    {truncatePrompt(item.prompt)}
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    onClick={() => handlePreview(item)}
                    size="sm"
                    variant="ghost"
                    className={`h-6 w-6 p-0 ${
                      previewingId === item.id
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                    title="Preview design"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleRollback(item)}
                    size="sm"
                    className="h-6 w-6 p-0 bg-green-500 hover:bg-green-600 text-white"
                    title="Rollback to this design"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Click the eye icon to preview, or the checkmark to rollback
        </p>
      </div>
    </div>
  );
}
