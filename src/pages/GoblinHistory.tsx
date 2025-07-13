import React from 'react';
import { History as HistoryIcon } from 'lucide-react';

const GoblinHistory = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <HistoryIcon className="w-9 h-9 text-professional-brown" />
        <h1 className="text-3xl font-bold text-foreground">
          Goblin Analysis History
        </h1>
      </div>
      
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          Your Goblin UX analysis history will appear here.
        </p>
      </div>
    </div>
  );
};

export default GoblinHistory;