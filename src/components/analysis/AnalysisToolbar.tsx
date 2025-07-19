import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, 
  Navigation, 
  RefreshCw, 
  Lightbulb, 
  Upload, 
  Download,
  Share,
  MoreHorizontal,
  ZoomIn
} from 'lucide-react';

export function AnalysisToolbar() {
  return (
    <div className="h-14 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Left Side Tools */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <LayoutGrid className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="sm" className="bg-secondary">
          <Navigation className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Lightbulb className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Upload className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
        
        {/* Zoom Control */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-muted-foreground">100%</span>
          <Button variant="ghost" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Export
        </Button>
        <Button variant="outline" size="sm">
          Details
        </Button>
        <Button size="sm">
          Share
        </Button>
      </div>
    </div>
  );
}