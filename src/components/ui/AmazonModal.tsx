
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AmazonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AmazonModal: React.FC<AmazonModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="amazon-modal-overlay">
      <div className={`amazon-modal ${sizeClasses[size]} ${className}`}>
        <div className="amazon-modal-header">
          <h2 className="amazon-modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="amazon-modal-close"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="amazon-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

interface AmazonModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const AmazonModalFooter: React.FC<AmazonModalFooterProps> = ({
  children,
  className = ''
}) => (
  <div className={`amazon-modal-footer ${className}`}>
    {children}
  </div>
);
