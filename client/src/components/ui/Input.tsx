import React, { InputHTMLAttributes, forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  authStyle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, authStyle = false, ...props }, ref) => {
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = props.type === 'password';
    const inputType = isPassword && showPassword ? 'text' : props.type;

    return (
      <div className="w-full">
        {label && !authStyle && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          {label && authStyle && (
            <label htmlFor={inputId} className="absolute left-5 top-3 z-10 text-xs font-semibold tracking-wide text-muted-foreground">
              {label}
            </label>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`flex w-full border bg-background text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-[border-color,box-shadow,background-color] ${authStyle ? 'h-16 rounded-[18px] border-border/90 px-5 pb-1.5 pt-6 text-base placeholder:text-transparent hover:border-primary/40 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:ring-offset-0' : 'h-10 rounded-md border-border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'} ${icon ? 'pl-10' : ''} ${isPassword && authStyle ? 'pr-14' : ''} ${error ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : ''} ${className}`}
            {...props}
            type={inputType}
          />
          {isPassword && authStyle && (
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
