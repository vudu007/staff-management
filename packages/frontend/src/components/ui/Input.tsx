'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: any;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className, wrapperClassName, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border bg-white text-sm transition-all duration-200',
              'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none',
              'placeholder:text-gray-400',
              Icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
              error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, wrapperClassName, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition-all duration-200',
            'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none',
            error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
