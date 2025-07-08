'use client';

import { useState, useEffect } from 'react';

const bootupSequence = [
  { text: '> Initializing client runtime...', delay: 15 },
  { text: '\n', delay: 200 },
  { text: '> Connecting to host...', delay: 10 },
  { text: ' OK', delay: 100 },
  { text: '\n', delay: 150 },
  { text: '> Loading core modules...\n', delay: 15 },
  { text: '  - next/runtime... ', delay: 10 },
  { text: '[LOADED]', delay: 50 },
  { text: '\n  - react/dom... ', delay: 10 },
  { text: '[LOADED]', delay: 65 },
  { text: '\n  - @react-three/fiber... ', delay: 10 },
  { text: '[LOADED]', delay: 80 },
  { text: '\n', delay: 200 },
  { text: '> Hydrating components...\n', delay: 15 },
  { text: '  - GameBoard... ', delay: 10 },
  { text: '[OK]', delay: 65 },
  { text: '\n  - ShipSelector... ', delay: 10 },
  { text: '[OK]', delay: 50 },
  { text: '\n  - GameStatus... ', delay: 10 },
  { text: '[OK]', delay: 30 },
  { text: '\n', delay: 200 },
  { text: '> Finalizing state... ', delay: 15 },
  { text: '[DONE]', delay: 100 },
  { text: '\n\n', delay: 500 },
  { text: '> Boot sequence complete. Handing over to UI.', delay: 25 },
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
