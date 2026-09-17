import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-muted text-foreground hover:bg-muted/80',
    outline: 'text-foreground border-border',
    success: 'border-transparent bg-green-500/15 text-green-700 dark:text-green-400',
    warning: 'border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
    danger: 'border-transparent bg-red-500/15 text-red-700 dark:text-red-400',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
