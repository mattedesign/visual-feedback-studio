
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BookOpen } from 'lucide-react';

interface RAGToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export const RAGToggle: React.FC<RAGToggleProps> = ({
  enabled,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
      <BookOpen className="w-5 h-5 text-blue-400" />
      <div className="flex-1">
        <Label htmlFor="rag-toggle" className="text-sm font-medium">
          Research Enhancement
        </Label>
        <p className="text-xs text-slate-400 mt-1">
          Use UX research insights to enhance analysis
        </p>
      </div>
      <Switch
        id="rag-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
    </div>
  );
};
