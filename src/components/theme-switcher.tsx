
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Settings, Palette, Bot, RefreshCcw } from 'lucide-react';
import { useGame } from '@/hooks/use-game';

type Theme = 'default' | 'dark' | 'deep-sea' | 'arctic' | 'volcanic';

const themeLabels: Record<Theme, string> = {
  default: 'Default Light',
  dark: 'Default Dark',
  'deep-sea': 'Deep Sea',
  arctic: 'Arctic',
  volcanic: 'Volcanic',
};

const allThemeClasses = ['dark', 'theme-deep-sea', 'theme-arctic', 'theme-volcanic'];

export function SettingsMenu({ onAssistantToggle, isAssistantEnabled }: { onAssistantToggle: () => void, isAssistantEnabled: boolean }) {
  const { resetGame } = useGame();
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const storedTheme = localStorage.getItem('battleship-theme') as Theme | null;
    if (storedTheme && themeLabels[storedTheme]) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove(...allThemeClasses);

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
          <span className="sr-only">Open settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {Object.entries(themeLabels).map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => setTheme(key as Theme)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={onAssistantToggle}>
          <Bot className="mr-2 h-4 w-4" />
          <span>{isAssistantEnabled ? 'Disable' : 'Enable'} Assistant</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={resetGame} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
          <RefreshCcw className="mr-2 h-4 w-4" />
          <span>Reset Game</span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
