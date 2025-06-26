
import React from 'react';

interface AmazonFormProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const AmazonForm: React.FC<AmazonFormProps> = ({
  children,
  title,
  subtitle,
  onSubmit,
  className = ''
}) => {
  return (
    <div className={`amazon-card max-w-md mx-auto ${className}`}>
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </div>
  );
};

interface AmazonFormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const AmazonFormField: React.FC<AmazonFormFieldProps> = ({
  label,
  type = 'text',
  placeholder,
  required,
  error,
  success,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`amazon-form-group ${className}`}>
      <label className="amazon-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className={`amazon-input ${error ? 'border-red-500' : ''} ${success ? 'border-green-500' : ''}`}
        required={required}
        value={value}
        onChange={onChange}
      />
      {error && (
        <div className="amazon-form-error">
          <span>⚠️</span>
          {error}
        </div>
      )}
      {success && (
        <div className="amazon-form-success">
          <span>✅</span>
          {success}
        </div>
      )}
    </div>
  );
};

interface AmazonTextareaFieldProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
}

export const AmazonTextareaField: React.FC<AmazonTextareaFieldProps> = ({
  label,
  placeholder,
  required,
  error,
  success,
  value,
  onChange,
  rows = 4,
  className = ''
}) => {
  return (
    <div className={`amazon-form-group ${className}`}>
      <label className="amazon-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        className={`amazon-textarea ${error ? 'border-red-500' : ''} ${success ? 'border-green-500' : ''}`}
        required={required}
        value={value}
        onChange={onChange}
        rows={rows}
        style={{ minHeight: `${rows * 1.5}em` }}
      />
      {error && (
        <div className="amazon-form-error">
          <span>⚠️</span>
          {error}
        </div>
      )}
      {success && (
        <div className="amazon-form-success">
          <span>✅</span>
          {success}
        </div>
      )}
    </div>
  );
};

interface AmazonSelectFieldProps {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export const AmazonSelectField: React.FC<AmazonSelectFieldProps> = ({
  label,
  options,
  placeholder = 'Please select...',
  required,
  error,
  success,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`amazon-form-group ${className}`}>
      <label className="amazon-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className={`amazon-select ${error ? 'border-red-500' : ''} ${success ? 'border-green-500' : ''}`}
        required={required}
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="amazon-form-error">
          <span>⚠️</span>
          {error}
        </div>
      )}
      {success && (
        <div className="amazon-form-success">
          <span>✅</span>
          {success}
        </div>
      )}
    </div>
  );
};
