
import { ReactNode } from 'react';

interface PositiveLanguageWrapperProps {
  children: ReactNode;
  annotations: Array<{
    severity: string;
    feedback: string;
    category: string;
  }>;
}

export const PositiveLanguageWrapper = ({ children, annotations }: PositiveLanguageWrapperProps) => {
  // Transform negative language to positive, opportunity-focused language
  const transformLanguage = (text: string): string => {
    return text
      .replace(/\bfix\b/gi, 'enhance')
      .replace(/\bproblem\b/gi, 'opportunity')
      .replace(/\bissue\b/gi, 'area for improvement')
      .replace(/\berror\b/gi, 'refinement needed')
      .replace(/\bbad\b/gi, 'could be optimized')
      .replace(/\bwrong\b/gi, 'can be improved')
      .replace(/\bfailed?\b/gi, 'opportunity to strengthen')
      .replace(/\byou should\b/gi, 'consider')
      .replace(/\byou must\b/gi, 'to further enhance')
      .replace(/\bthis is\b/gi, 'this presents an opportunity to');
  };

  const getEncouragingPrefix = () => {
    const criticalCount = annotations.filter(a => a.severity === 'critical').length;
    const totalCount = annotations.length;
    
    if (criticalCount === 0) {
      return "Your design shows strong fundamentals. To further enhance the user experience:";
    } else if (criticalCount <= 2) {
      return "Your design has a solid foundation with several areas ready for strategic enhancement:";
    } else {
      return "Your design demonstrates good potential. Here are key opportunities to elevate the user experience:";
    }
  };

  // Clone children and transform text content
  const transformChildren = (children: ReactNode): ReactNode => {
    if (typeof children === 'string') {
      return transformLanguage(children);
    }
    
    if (Array.isArray(children)) {
      return children.map((child, index) => (
        <span key={index}>{transformChildren(child)}</span>
      ));
    }
    
    return children;
  };

  return (
    <div className="positive-language-wrapper">
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
          {getEncouragingPrefix()}
        </p>
      </div>
      {transformChildren(children)}
    </div>
  );
};
