'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      style,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 ${className}`}
          style={{
            backgroundColor: 'var(--background)',
            color: 'var(--text-primary)',
            border: error ? '1px solid var(--error)' : '1px solid var(--border)',
            '--tw-ring-color': error ? 'var(--error)' : 'var(--primary)',
            ...style,
          } as React.CSSProperties}
          {...props}
        />
        {(error || helperText) && (
          <p
            className="mt-1.5 text-sm"
            style={{ color: error ? 'var(--error)' : 'var(--text-secondary)' }}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      style,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 resize-none ${className}`}
          style={{
            backgroundColor: 'var(--background)',
            color: 'var(--text-primary)',
            border: error ? '1px solid var(--error)' : '1px solid var(--border)',
            '--tw-ring-color': error ? 'var(--error)' : 'var(--primary)',
            ...style,
          } as React.CSSProperties}
          {...props}
        />
        {(error || helperText) && (
          <p
            className="mt-1.5 text-sm"
            style={{ color: error ? 'var(--error)' : 'var(--text-secondary)' }}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
