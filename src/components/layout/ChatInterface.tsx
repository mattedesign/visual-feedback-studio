import React, { useState } from 'react';
import { ClaudeMessages } from './ClaudeMessages';
import { UserMessage } from './UserMessage';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'claude';
  content: string;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue.trim(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        {/* Welcome message - only show if no user messages */}
        {messages.length === 0 && <ClaudeMessages />}
        
        {/* Message history */}
        <div className="space-y-0">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'user' && (
                <UserMessage message={message.content} />
              )}
              {/* Claude responses would go here */}
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[#E2E2E2]">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about UX improvements..."
              className="w-full px-3 py-2 text-sm border border-[#E2E2E2] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#22757C]/20 focus:border-[#22757C]"
              style={{
                minHeight: '36px',
                maxHeight: '100px',
                color: '#121212'
              }}
              rows={1}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: inputValue.trim() ? '#22757C' : '#F1F1F1',
              color: inputValue.trim() ? '#FCFCFC' : '#7B7B7B'
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};