
import React from 'react';

interface AmazonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const AmazonButton: React.FC<AmazonButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = `amazon-button-${variant}`;
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-6 py-3',
    lg: 'text-lg px-8 py-4'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClass} ${sizeClasses[size]} ${className} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="amazon-loading" />
      )}
      {!loading && icon && icon}
      {children}
    </button>
  );
};
