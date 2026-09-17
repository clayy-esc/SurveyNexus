import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  width?: 'w-48' | 'w-56' | 'w-64' | 'w-auto';
  placement?: 'top' | 'bottom';
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'right', width = 'w-48', placement = 'bottom' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';
  const placementClass = placement === 'top'
    ? 'bottom-full mb-2 origin-bottom-right'
    : 'mt-2 origin-top-right';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute z-40 ${placementClass} ${width} ${alignmentClass} max-h-[calc(100vh-2rem)] overflow-y-auto rounded-md bg-card border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100`}
          role="menu"
          aria-orientation="vertical"
          onClick={() => setIsOpen(false)} // Close on click inside
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean; destructive?: boolean }> = ({ 
  children, 
  className = '', 
  disabled = false,
  destructive = false,
  ...props 
}) => {
  return (
    <div
      className={`block px-4 py-2 text-sm cursor-pointer transition-colors ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : destructive
            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
            : 'text-foreground hover:bg-muted hover:text-foreground'
      } ${className}`}
      role="menuitem"
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownDivider: React.FC = () => (
  <div className="h-px bg-border my-1" />
);
