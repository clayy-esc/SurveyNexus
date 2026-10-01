import React from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../../contexts/useTheme';
import { Button } from './Button';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9 rounded-xl border border-border/70 bg-card/70"
      title="Toggle theme"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <SunMedium className="h-4.5 w-4.5 rotate-0 scale-100 text-amber-500 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonStar className="absolute h-4.5 w-4.5 rotate-90 scale-0 text-primary transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
