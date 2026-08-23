import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasCustomText = className.includes('text-');
    const hasCustomBg = className.includes('bg-');

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#343A40]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#868E96] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
              hasCustomBg ? '' : 'bg-white'
            } ${leftIcon ? 'pl-9' : 'pl-3.5'} ${rightIcon ? 'pr-9' : 'pr-3.5'} py-2 ${
              error
                ? 'border-[#C0392B] focus:ring-[#C0392B]/20 text-[#C0392B]'
                : `border-[#DEE2E6] focus:border-[#1B3A5C] focus:ring-[#1B3A5C]/20 ${hasCustomText ? '' : 'text-[#212529]'}`
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#868E96] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-[11px] font-medium text-[#C0392B]">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-[#868E96]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
