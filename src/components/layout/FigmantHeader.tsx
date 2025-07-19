import React from 'react';
import { Bell, Settings, Share, Eye, Lightbulb, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FigmantHeader = () => {
  return (
    <div className="figmant-header">
      <div className="flex items-center gap-4">
        {/* Left side - View controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Lightbulb className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">100%</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Right side - Actions */}
        <Button variant="outline" size="sm">
          Export
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Details
          </Button>
          <Button variant="default" size="sm">
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};