import React, { forwardRef } from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', label, description, checked, ...props }, ref) => {
    return (
      <div className={`flex items-start justify-between gap-4 ${className}`}>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            {description && <span className="text-sm text-muted-foreground">{description}</span>}
          </div>
        )}
        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            ref={ref}
            {...props}
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-none after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    );
  }
);

Switch.displayName = 'Switch';
