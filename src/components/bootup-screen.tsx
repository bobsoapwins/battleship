'use client';

import { useState, useEffect } from 'react';

const bootupSequence = [
  { text: '> Initializing client runtime...', delay: 5 },
  { text: '\n', delay: 200 },
  { text: '> Connecting to host...', delay: 5 },
  { text: ' OK', delay: 50 },
  { text: '\n', delay: 150 },
  { text: '> Verifying asset cache...', delay: 5 },
  { text: ' [VALID]', delay: 60 },
  { text: '\n', delay: 150 },
  { text: '> Loading core modules...\n', delay: 5 },
  { text: '  - next/runtime... ', delay: 5 },
  { text: '[LOADED]', delay: 25 },
  { text: '\n  - react/dom... ', delay: 5 },
  { text: '[LOADED]', delay: 35 },
  { text: '\n  - lucide-react/icons... ', delay: 5 },
  { text: '[LOADED]', delay: 30 },
  { text: '\n', delay: 200 },
  { text: '> Hydrating UI components...\n', delay: 5 },
  { text: '  - GameBoard... ', delay: 5 },
  { text: '[OK]', delay: 35 },
  { text: '\n  - ShipSelector... ', delay: 5 },
  { text: '[OK]', delay: 25 },
  { text: '\n  - GameStatus... ', delay: 5 },
  { text: '[OK]', delay: 15 },
  { text: '\n  - SetupScreen... ', delay: 5 },
  { text: '[OK]', delay: 20 },
  { text: '\n', delay: 200 },
  { text: '> Finalizing state management... ', delay: 5 },
  { text: '[DONE]', delay: 50 },
  { text: '\n\n', delay: 500 },
  { text: '> Boot sequence complete. Handing over to UI.', delay: 10 },
];

interface BootupScreenProps {
  onComplete: () => void;
}

export const BootupScreen = ({ onComplete }: BootupScreenProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let currentIndex = 0;
    let currentText = '';

    const type = () => {
      if (currentIndex >= bootupSequence.length) {
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
    <div className="bg-black text-green-400 font-code min-h-screen w-full flex items-start p-8">
      <div className="w-full max-w-3xl">
        <pre className="whitespace-pre-wrap text-lg md:text-xl leading-relaxed">
          {displayedText}
        </pre>
      </div>
    </div>
  );
};
