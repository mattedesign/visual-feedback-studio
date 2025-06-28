
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface StudioChatProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const StudioChat = ({ workflow }: StudioChatProps) => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // TODO: Implement chat functionality
    console.log('Chat message:', message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`bg-slate-700 border-t border-slate-600 transition-all duration-200 ${
      isExpanded ? 'h-64' : 'h-12'
    }`}>
      {/* Chat Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-slate-600">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">AI Assistant</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white hover:bg-slate-600"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <Card className="bg-slate-600/50 border-slate-500">
              <CardContent className="p-3">
                <p className="text-sm text-slate-300">
                  Hello! I'm your AI assistant. Ask me questions about your design analysis, 
                  request improvements, or get help with UX best practices.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-600">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your design analysis..."
                className="flex-1 bg-slate-600 border-slate-500 text-white placeholder-slate-400"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
