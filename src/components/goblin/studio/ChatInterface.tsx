import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Upload, 
  Target,
  MessageSquare,
  Bot,
  User,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type: 'text' | 'annotation' | 'insight';
  created_at: string;
  annotation_data?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    feedback_type: string;
    description: string;
  };
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  onImageUpload: (file: File) => void;
  onBatchImageUpload?: (files: File[]) => void;
  isLoading: boolean;
  sessionTitle: string;
  imageCount: number;
  annotationCount: number;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onImageUpload,
  onBatchImageUpload,
  isLoading,
  sessionTitle,
  imageCount,
  annotationCount
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    
    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsUploading(true);
      if (files.length === 1) {
        onImageUpload(files[0]);
      } else if (onBatchImageUpload) {
        onBatchImageUpload(files);
      } else {
        // Fallback: upload files one by one if batch upload not supported
        files.forEach(file => onImageUpload(file));
      }
      // Reset after a delay (assuming upload completes)
      setTimeout(() => setIsUploading(false), 2000);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageIcon = (message: ChatMessage) => {
    if (message.role === 'user') return <User className="w-4 h-4" />;
    if (message.message_type === 'annotation') return <Target className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const isAnnotation = message.message_type === 'annotation';

    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
            isAnnotation ? 'bg-primary' : 'bg-secondary'
          }`}>
            {getMessageIcon(message)}
          </div>
        )}
        
        <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
          <Card className={`p-3 ${
            isUser 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : isAnnotation 
                ? 'bg-primary/10 border-primary' 
                : 'bg-muted'
          }`}>
            {isAnnotation && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {message.annotation_data?.feedback_type || 'Annotation'}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {message.annotation_data?.label}
                </Badge>
              </div>
            )}
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
          </Card>
          
          <div className={`text-xs text-muted-foreground ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </div>
        </div>

        {isUser && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-foreground">Analysis Chat</h3>
        <p className="text-sm text-muted-foreground">
          Ask questions about your designs
        </p>
      </div>

      {/* Session Status */}
      <div className="p-4 bg-muted/30 border-b border-border">
        <div className="text-sm">
          <div className="font-medium text-foreground mb-1">{sessionTitle}</div>
          <div className="text-muted-foreground">
            {imageCount} images • {annotationCount} annotations
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(renderMessage)}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <Card className="p-3 bg-muted">
                <div className="text-sm text-muted-foreground">
                  Analyzing your design...
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border space-y-2">
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || imageCount >= 5}
            className="flex items-center gap-1"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-xs">
              Upload Image {isUploading ? 'ing...' : `(${imageCount}/5)`}
            </span>
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              placeholder="Ask about your design..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="min-h-[40px] resize-none"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Tip: You can ask about specific areas, request UX feedback, or create annotations
            </div>
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}