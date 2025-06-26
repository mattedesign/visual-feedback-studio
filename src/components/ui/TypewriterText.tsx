
import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  delay?: number;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  texts,
  speed = 100,
  delay = 2000,
  className = ''
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isTyping) {
      if (currentText.length < texts[currentTextIndex].length) {
        timeout = setTimeout(() => {
          setCurrentText(texts[currentTextIndex].slice(0, currentText.length + 1));
        }, speed);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, delay);
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, speed / 2);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isTyping, texts, speed, delay]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};
