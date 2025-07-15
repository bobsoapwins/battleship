
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
import { Settings, Sun, Moon, Palette } from 'lucide-react';

type Theme = 'default' | 'dark' | 'deep-sea' | 'arctic' | 'volcanic';

const themeLabels: Record<Theme, string> = {
  default: 'Default Light',
  dark: 'Default Dark',
  'deep-sea': 'Deep Sea',
  arctic: 'Arctic',
  volcanic: 'Volcanic',
};

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const storedTheme = localStorage.getItem('battleship-theme') as Theme | null;
    if (storedTheme && themeLabels[storedTheme]) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove(...Object.keys(themeLabels).map(t => t === 'dark' ? 'dark' : `theme-${t}`));
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
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
