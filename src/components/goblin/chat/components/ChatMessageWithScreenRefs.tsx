import React from 'react';
import { ParsedText } from '@/utils/textParsing';
import { ChatMessage } from '../types';

interface ChatMessageWithScreenRefsProps {
  message: ChatMessage;
  className?: string;
}

export function ChatMessageWithScreenRefs({ message, className }: ChatMessageWithScreenRefsProps) {
  return (
    <div className={className}>
      <ParsedText>{message.content}</ParsedText>
    </div>
  );
}