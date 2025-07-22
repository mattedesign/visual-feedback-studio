
import React from 'react';
import { ChatMessage } from '../types';

interface ChatMessageWithScreenRefsProps {
  message: ChatMessage;
  className?: string;
}

export function ChatMessageWithScreenRefs({ message, className }: ChatMessageWithScreenRefsProps) {
  return (
    <div className={className}>
      {message.content}
    </div>
  );
}
