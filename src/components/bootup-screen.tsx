'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const bootupSequence = [
  { text: '> Initializing Naval Combat System...', delay: 50 },
  { text: '\n', delay: 500 },
  { text: '> Loading strategic modules... ', delay: 40 },
  { text: '[25%]', delay: 200 },
  { text: '\n', delay: 500 },
  { text: '> Calibrating sensor arrays... ', delay: 40 },
  { text: '[50%]', delay: 200 },
  { text: '\n', delay: 500 },
  { text: '> Warming up weapon systems... ', delay: 30 },
  { text: '[75%]', delay: 200 },
  { text: '\n', delay: 500 },
  { text: '> All systems operational. ', delay: 50 },
  { text: '[100%]', delay: 200 },
  { text: '\n\n', delay: 700 },
  { text: '> Welcome, Admiral.', delay: 80 },
];

interface BootupScreenProps {
  onComplete: () => void;
}

export const BootupScreen = ({ onComplete }: BootupScreenProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    let currentText = '';

    const type = () => {
      if (currentIndex >= bootupSequence.length) {
        setShowCursor(false);
        setTimeout(onComplete, 1200); // Wait after finishing
        return;
      }

      const { text, delay } = bootupSequence[currentIndex];
      let charIndex = 0;

      const typeChar = () => {
        if (charIndex < text.length) {
          currentText += text.charAt(charIndex);
          setDisplayedText(currentText);
          charIndex++;
          setTimeout(typeChar, delay);
        } else {
          currentIndex++;
          type();
        }
      };
      
      const startTypingTimeout = setTimeout(typeChar, 100);
      return () => clearTimeout(startTypingTimeout);
    };

    const startTimeout = setTimeout(type, 500);

    return () => clearTimeout(startTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-black text-green-400 font-code min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <pre className="whitespace-pre-wrap text-lg md:text-xl leading-relaxed">
          {displayedText}
          <span className={cn('inline-block w-3 h-6 bg-green-400 ml-1', { 'animate-pulse': showCursor, 'hidden': !showCursor })} />
        </pre>
      </div>
    </div>
  );
};
