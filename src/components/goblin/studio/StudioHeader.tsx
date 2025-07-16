import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, Share, Settings, Sparkles } from 'lucide-react';

interface StudioHeaderProps {
  sessionTitle: string;
  onNewSession: () => void;
  onSaveSession: () => void;
  onShareSession: () => void;
  onSettings: () => void;
}

export function StudioHeader({ 
  sessionTitle, 
  onNewSession, 
  onSaveSession, 
  onShareSession, 
  onSettings 
}: StudioHeaderProps) {
  return (
    <div className="h-full flex items-center justify-between px-4">
      {/* Left - Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Goblin UX Studio</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground truncate max-w-xs">
          {sessionTitle}
        </span>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onNewSession}>
          <Plus className="w-4 h-4 mr-1" />
          New Session
        </Button>
        <Button variant="ghost" size="sm" onClick={onSaveSession}>
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={onShareSession}>
          <Share className="w-4 h-4 mr-1" />
          Share
        </Button>
        <Button variant="ghost" size="sm" onClick={onSettings}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}