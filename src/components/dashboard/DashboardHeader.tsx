import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Columns, Settings } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* View Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Columns className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}