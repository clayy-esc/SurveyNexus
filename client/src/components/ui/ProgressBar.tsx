import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '', height = 'sm', showLabel = false }) => {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs font-medium text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-muted rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div 
          className="bg-primary h-full transition-all duration-500 ease-out rounded-full" 
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
