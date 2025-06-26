
import React from 'react';

interface AmazonCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  hover?: boolean;
}

export const AmazonCard: React.FC<AmazonCardProps> = ({
  children,
  className = '',
  interactive = false,
  onClick,
  hover = true
}) => {
  const baseClasses = 'amazon-card';
  const interactiveClasses = interactive ? 'amazon-card-interactive' : '';
  const hoverClasses = hover ? '' : 'hover:transform-none hover:shadow-sm';
  
  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export const AmazonCardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const AmazonCardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <h3 className={`text-xl font-semibold text-slate-900 ${className}`}>
    {children}
  </h3>
);

export const AmazonCardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={className}>
    {children}
  </div>
);

export const AmazonCardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);
