import React, { useState, useRef } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-foreground',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-foreground',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-foreground',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-foreground',
  };

  return (
    <div 
      className="relative inline-flex" 
      ref={containerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-background bg-foreground rounded whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div className={`absolute border-4 border-transparent ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};
