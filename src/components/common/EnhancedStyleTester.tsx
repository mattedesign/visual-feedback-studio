
import React from 'react';
import { Button } from '@/components/ui/button';

export const EnhancedStyleTester = () => {
  const testStyles = () => {
    console.log('Testing enhanced styles...');
    
    // Test if enhanced classes exist
    const testElement = document.createElement('div');
    testElement.className = 'enhanced-button-primary';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    console.log('Enhanced button primary styles:', {
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      border: computedStyle.border
    });
    
    document.body.removeChild(testElement);
  };

  return (
    <div className="p-4 border border-slate-600 rounded bg-slate-800/50 mb-4">
      <h3 className="text-lg font-semibold mb-3">Enhanced Style Tester</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-slate-300 mb-1">Enhanced Button Primary:</p>
          <button className="enhanced-button-primary px-4 py-2 rounded">
            Test Enhanced Button
          </button>
        </div>
        
        <div>
          <p className="text-sm text-slate-300 mb-1">Enhanced Button Secondary:</p>
          <button className="enhanced-button-secondary px-4 py-2 rounded">
            Test Secondary Button
          </button>
        </div>
        
        <div>
          <p className="text-sm text-slate-300 mb-1">Hover Effects:</p>
          <div className="hover-lift bg-slate-700 p-2 rounded cursor-pointer">
            Hover Lift Effect
          </div>
        </div>
        
        <div>
          <p className="text-sm text-slate-300 mb-1">Gradient Text:</p>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Gradient Text Test
          </h2>
        </div>
        
        <Button onClick={testStyles} variant="outline" size="sm">
          Run Style Debug Test
        </Button>
      </div>
    </div>
  );
};
