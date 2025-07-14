import React from 'react';
import { ScreenReference } from '@/components/goblin/ScreenReference';
import { TextParsingErrorBoundary } from '@/components/goblin/TextParsingErrorBoundary';

/**
 * Parses text and converts screen references (e.g., "Screen 1", "screen 2") into clickable components
 */
export function parseScreenReferences(text: string): React.ReactNode[] {
  try {
    if (!text || typeof text !== 'string') {
      console.warn('parseScreenReferences received invalid text input:', typeof text, text);
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
      
      // Validate screen number with defensive checks
      if (isNaN(screenNumber) || screenNumber < 1 || screenNumber > 999) {
        console.warn('Invalid screen number detected:', screenNumberStr);
        // Add the text as-is without parsing
        if (match.index > lastIndex) {
          const beforeText = text.slice(lastIndex, match.index);
          if (beforeText) parts.push(beforeText);
        }
        parts.push(fullMatch);
        lastIndex = match.index + fullMatch.length;
        continue;
      }
      
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (beforeText) {
          parts.push(beforeText);
        }
      }
      
      // Add the screen reference component with enhanced error protection
      try {
        const screenRefKey = `screen-ref-${screenNumber}-${keyCounter++}-${Date.now()}`;
        parts.push(
          <TextParsingErrorBoundary 
            key={screenRefKey}
            fallback={<span className="text-muted-foreground">Screen {screenNumber}</span>}
            originalText={`Screen ${screenNumber}`}
          >
            <ScreenReference 
              screenNumber={screenNumber}
              className="mx-1"
            />
          </TextParsingErrorBoundary>
        );
      } catch (componentError) {
        console.error('ScreenReference component creation error:', componentError);
        // Defensive fallback to plain text
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
    
    // Enhanced validation and fallback
    if (parts.length === 0) {
      console.warn('No parts generated from text parsing, returning original text');
      return [text];
    }
    
    return parts;
  } catch (error) {
    console.error('Critical parseScreenReferences error:', error, 'Text:', text);
    // Ultimate graceful degradation - return original text wrapped safely
    return [text || 'Text parsing failed'];
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
  try {
    if (!children || typeof children !== 'string') {
      console.warn('ParsedText received invalid children:', typeof children, children);
      return <span className={className}>{children || ''}</span>;
    }

    const parsedParts = parseScreenReferences(children);
    
    // If className is provided, we need a wrapper element
    if (className) {
      return (
        <TextParsingErrorBoundary 
          originalText={children}
          fallback={<span className={className}>{children}</span>}
        >
          <span className={className}>
            {parsedParts.map((part, index) => (
              <span key={`parsed-text-fragment-${index}-${typeof part === 'string' ? part.slice(0, 10) : 'component'}`}>
                {part}
              </span>
            ))}
          </span>
        </TextParsingErrorBoundary>
      );
    }

    // For no className, use pure React.Fragment approach
    return (
      <TextParsingErrorBoundary 
        originalText={children}
        fallback={<>{children}</>}
      >
        <>
          {parsedParts.map((part, index) => (
            <span key={`parsed-text-pure-fragment-${index}-${typeof part === 'string' ? part.slice(0, 10) : 'component'}`}>
              {part}
            </span>
          ))}
        </>
      </TextParsingErrorBoundary>
    );
  } catch (error) {
    console.error('ParsedText rendering error:', error);
    // Ultimate fallback with or without className
    return <span className={className}>{children || 'Text rendering failed'}</span>;
  }
}