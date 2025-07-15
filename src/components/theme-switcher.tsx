
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Palette } from 'lucide-react';

type Theme = 'default' | 'dark' | 'deep-sea' | 'arctic' | 'volcanic';

const themeLabels: Record<Theme, string> = {
  default: 'Default Light',
  dark: 'Default Dark',
  'deep-sea': 'Deep Sea',
  arctic: 'Arctic',
  volcanic: 'Volcanic',
};

const allThemeClasses = ['dark', 'theme-deep-sea', 'theme-arctic', 'theme-volcanic'];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const storedTheme = localStorage.getItem('battleship-theme') as Theme | null;
    if (storedTheme && themeLabels[storedTheme]) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all possible theme classes
    root.classList.remove(...allThemeClasses);

    // Add the class for the selected theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme !== 'default') {
      root.classList.add(`theme-${theme}`);
    }
    
    localStorage.setItem('battleship-theme', theme);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>Select Theme</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(themeLabels).map(([key, label]) => (
          <DropdownMenuItem key={key} onClick={() => setTheme(key as Theme)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
