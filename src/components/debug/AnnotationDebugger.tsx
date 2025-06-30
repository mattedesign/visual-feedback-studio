
import { useEffect } from 'react';

interface AnnotationDebuggerProps {
  annotations: any[];
  componentName: string;
}

export const AnnotationDebugger = ({ annotations, componentName }: AnnotationDebuggerProps) => {
  useEffect(() => {
    console.log(`🐛 ${componentName} - Annotation Debug:`, {
      totalAnnotations: annotations.length,
      annotationDetails: annotations.map((annotation, index) => ({
        index,
        displayNumber: index + 1,
        id: annotation.id,
        category: annotation.category,
        severity: annotation.severity,
        x: annotation.x,
        y: annotation.y
      }))
    });

    // Force a DOM check for any "otat" text
    setTimeout(() => {
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        if (el.textContent?.includes('otat') || el.innerHTML?.includes('otat')) {
          console.error('🚨 Found "otat" text in element:', {
            element: el,
            textContent: el.textContent,
            innerHTML: el.innerHTML,
            className: el.className
          });
        }
      });
    }, 1000);
  }, [annotations, componentName]);

  return null;
};
