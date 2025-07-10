import React from 'react';
import { ScreenReference } from '@/components/goblin/ScreenReference';

/**
 * Parses text and converts screen references (e.g., "Screen 1", "screen 2") into clickable components
 */
export function parseScreenReferences(text: string): React.ReactNode[] {
  if (!text) return [text];
  
  const screenRegex = /\b(screen|Screen)\s+(\d+)\b/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = screenRegex.exec(text)) !== null) {
    const [fullMatch, , screenNumberStr] = match;
    const screenNumber = parseInt(screenNumberStr, 10);
    
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      if (beforeText) {
        parts.push(beforeText);
      }
    }
    
    // Add the screen reference component
    parts.push(
      <ScreenReference 
        key={`screen-${screenNumber}-${keyCounter++}`} 
        screenNumber={screenNumber}
        className="mx-1"
      />
    );
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Add remaining text after the last match
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      parts.push(remainingText);
    }
  }
  
  // If no matches found, return the original text
  return parts.length > 0 ? parts : [text];
}

/**
 * Component that renders text with clickable screen references
 */
interface ParsedTextProps {
  children: string;
  className?: string;
}

export function ParsedText({ children, className }: ParsedTextProps) {
  const parsedContent = parseScreenReferences(children);
  
  return (
    <span className={className}>
      {parsedContent.map((part, index) => (
        <React.Fragment key={`parsed-text-${index}`}>{part}</React.Fragment>
      ))}
    </span>
  );
}