import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Zap, Send, Clock } from 'lucide-react';

interface StudioChatProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const StudioChat = ({ workflow }: StudioChatProps) => {
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log('Chat message sent:', chatMessage);
      setChatMessage('');
      setIsTyping(true);
      
      // Simulate AI response
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-3">
          <button className="w-10 h-10 bg-gray-900 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg px-4 py-3">
            <input
              type="text"
              placeholder="Ask about your design analysis..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
            <button className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mr-3">
              <Clock className="w-4 h-4 mr-1" />
              Claude Sonnet 4
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button 
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        
        {isTyping && (
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">AI is analyzing your question...</span>
          </div>
        )}
      </div>
    </div>
  );
};