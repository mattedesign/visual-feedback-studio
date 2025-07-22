
import React from 'react';

interface LoadingIndicatorProps {
  session: any;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ session }) => {
  const getPersonaIcon = (personaType: string) => {
    switch (personaType) {
      case 'clarity': return '👾 Clarity';
      case 'mirror': return '🪞 Mirror';
      case 'strategic': return '📊 Strategist';
      case 'mad': return '🔬 Mad Scientist';
      case 'executive': return '💼 Executive';
      default: return '🤖 AI Assistant';
    }
  };

  return (
    <div className="flex justify-start">
      <div className="bg-muted border-l-4 border-green-500 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-green-600">
            {getPersonaIcon(session?.persona_type)}
          </span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
