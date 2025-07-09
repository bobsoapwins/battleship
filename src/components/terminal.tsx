'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface TerminalProps {
  onCommand: (command: string) => void;
  onClose: () => void;
}

export const Terminal = ({ onCommand, onClose }: TerminalProps) => {
  const [input, setInput] = useState('/');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCommand(input);
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-8 backdrop-blur-sm">
      <div className="relative w-full max-w-lg">
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onClose}
          className="bg-black/80 text-green-400 border-green-400/50 font-code text-lg w-full"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
};
