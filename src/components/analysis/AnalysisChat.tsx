import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Mic, Send } from 'lucide-react';

export function AnalysisChat() {
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: 1,
      role: 'assistant',
      content: "Welcome to Figmant. You can upload image(s) to start an analysis."
    },
    {
      id: 2,
      role: 'user',
      content: "I want to start a new analysis."
    },
    {
      id: 3,
      role: 'assistant',
      content: "Thinking..."
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-sm font-medium">
                {msg.role === 'assistant' ? 'F' : 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-foreground">{msg.content}</div>
              {msg.role === 'assistant' && msg.content === 'Thinking...' && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    I want to start a new analysis.
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">What would you like to analyze?</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button variant="ghost" size="sm">
              <Mic className="w-4 h-4" />
            </Button>
            <Button size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}