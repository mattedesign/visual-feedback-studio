import React from 'react';
import { ScreenReference } from '@/components/goblin/ScreenReference';
import { TextParsingErrorBoundary } from '@/components/goblin/TextParsingErrorBoundary';

/**
 * Parses text and converts screen references (e.g., "Screen 1", "screen 2") into clickable components
 */
export function parseScreenReferences(text: string): React.ReactNode[] {
  try {
    if (!text || typeof text !== 'string') {
      return [text || ''];
    }
    
    const screenRegex = /\b(screen|Screen)\s+(\d+)\b/gi;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    while ((match = screenRegex.exec(text)) !== null) {
      const [fullMatch, , screenNumberStr] = match;
      const screenNumber = parseInt(screenNumberStr, 10);
      
      // Validate screen number
      if (isNaN(screenNumber) || screenNumber < 1) {
        continue;
      }
      
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (beforeText) {
          parts.push(beforeText);
        }
      }
      
      // Add the screen reference component with error boundary protection
      try {
        parts.push(
          <ScreenReference 
            key={`screen-ref-${screenNumber}-${keyCounter++}`} 
            screenNumber={screenNumber}
            className="mx-1"
          />
        );
      } catch (componentError) {
        console.error('ScreenReference component error:', componentError);
        // Fallback to plain text
        parts.push(`Screen ${screenNumber}`);
      }
      
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
  } catch (error) {
    console.error('parseScreenReferences error:', error);
    // Graceful degradation - return original text
    return [text || ''];
  }
}

/**
 * Component that renders text with clickable screen references
 */
interface ParsedTextProps {
  children: string;
  className?: string;
}

export function ParsedText({ children, className }: ParsedTextProps) {
  return (
    <TextParsingErrorBoundary originalText={children}>
      <span className={className}>
        {parseScreenReferences(children).map((part, index) => (
          <React.Fragment key={`parsed-text-fragment-${index}`}>
            {part}
          </React.Fragment>
        ))}
      </span>
    </TextParsingErrorBoundary>
  );
}