
import React from 'react';

export const StyleDebugger = () => {
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-50 max-w-xs">
      <div className="mb-2 font-bold">Style Debug Info:</div>
      <div className="space-y-1">
        <div className="bg-slate-900 p-1 rounded">BG: slate-900 ✓</div>
        <div className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Gradient Text Test
        </div>
        <div className="enhanced-button-primary p-1 rounded text-center">
          Enhanced Button Test
        </div>
        <div className="hover-lift p-1 bg-slate-700 rounded">
          Hover Lift Test
        </div>
      </div>
    </div>
  );
};
