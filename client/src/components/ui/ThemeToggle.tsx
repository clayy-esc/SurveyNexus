import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/useTheme';
import { Button } from './Button';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full w-9 h-9"
      title="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-200" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
