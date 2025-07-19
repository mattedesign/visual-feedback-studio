import React, { useState } from 'react';
import { ClaudeMessages } from './ClaudeMessages';
import { UserMessage } from './UserMessage';
import { Plus, Mic, ArrowUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'claude';
  content: string;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        // Handle image upload
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: `📎 Uploaded image: ${file.name}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        
        toast({
          title: "Image uploaded",
          description: `${file.name} is ready for analysis`,
        });
      }
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 10,
    noClick: true // We'll handle click separately
  });

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

  const handleFileClick = () => {
    // Trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        onDrop(Array.from(files));
      }
    };
    input.click();
  };

  return (
    <div 
      {...getRootProps()}
      className={`flex-1 flex flex-col h-full ${isDragActive ? 'bg-[#22757C]/5' : ''}`}
    >
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

      {/* Chat Input Container */}
      <div 
        className="relative"
        style={{
          height: '128px',
          width: '280px',
          margin: '0 4px'
        }}
      >
        <input {...getInputProps()} />
        
        {/* Input Area */}
        <div 
          className="absolute top-0 left-0 right-0 bg-[#FCFCFC] rounded-t-[20px] border-l border-r border-t border-[#E2E2E2] px-4 py-4"
          style={{ height: '68px' }}
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What would you like to analyze?"
            className="w-full h-full text-sm text-[#222222] text-opacity-50 bg-transparent resize-none focus:outline-none placeholder:text-[#222222] placeholder:text-opacity-50"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* Divider */}
        <div 
          className="absolute border-t border-[#E2E2E2]"
          style={{ 
            top: '68px',
            left: 0,
            right: 0
          }}
        />

        {/* Bottom Controls */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-[#F1F1F1] rounded-b-[20px] border-l border-r border-b border-[#E2E2E2] px-4 py-4 flex items-center justify-between"
          style={{ height: '60px' }}
        >
          {/* Plus Icon - File Upload */}
          <div 
            className="w-10 h-10 bg-[#FCFCFC] border border-[#E2E2E2] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#F8F8F8] transition-colors"
            onClick={handleFileClick}
          >
            <Plus className="w-5 h-5 text-[#323232]" />
          </div>

          {/* Mic Icon */}
          <div className="flex items-center justify-center">
            <Mic className="w-5 h-5 text-[#7B7B7B]" strokeWidth={1.5} />
          </div>

          {/* Send Button */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              background: 'linear-gradient(180deg, #E5E5E5 0%, #E2E2E2 100%)',
              border: '1px solid #D4D4D4',
              filter: 'drop-shadow(0px 0px 0px #D4D4D4) drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.15))',
              boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.33)'
            }}
            onClick={handleSendMessage}
          >
            <ArrowUp className="w-4 h-4 text-[#121212]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Drag Overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-[#22757C]/10 border-2 border-dashed border-[#22757C] rounded-[20px] flex items-center justify-center">
            <div className="text-center">
              <Plus className="w-8 h-8 text-[#22757C] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#22757C]">Drop images here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};