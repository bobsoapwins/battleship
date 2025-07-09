'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface IntroScreenProps {
  onComplete: () => void;
}

type AnimationPhase = 'idle' | 'northDunne' | 'neoGames' | 'done';

const NorthDunneLogo = () => (
    <div className="w-32 h-32 relative mb-4">
        <Image 
            src="https://lh3.googleusercontent.com/a/ACg8ocKxic4LJaO2wgscGUK2Njli4A-zFtUOD_GxfsBSCZ_HuYlS3ZEr=s360-c-no" 
            alt="North Dunne Logo"
            layout="fill"
            objectFit="contain"
            data-ai-hint="mountain logo"
        />
    </div>
);

const NeoGamesLogo = () => (
    <div className="w-32 h-32 relative mb-4">
        <Image 
            src="https://placehold.co/128x128.png"
            alt="Neo Games Logo"
            layout="fill"
            objectFit="contain"
            data-ai-hint="futuristic geometric"
        />
    </div>
);

export const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  
  useEffect(() => {
    const sequence = [
      () => setPhase('northDunne'), // Show North Dunne
      () => setPhase('neoGames'),   // Show Neo Games
      () => setPhase('done'),       // Fade out
      () => onComplete(),           // Complete
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < sequence.length) {
        sequence[currentIndex]();
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2500); // Duration for each scene

    return () => clearInterval(interval);
  }, [onComplete]);

  const isVisible = (p: AnimationPhase) => phase === p;

  return (
    <div className="bg-black text-neutral-200 min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className={cn(
        'absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000',
        isVisible('northDunne') ? 'opacity-100' : 'opacity-0'
      )}>
        <NorthDunneLogo />
        <p className="font-headline text-2xl tracking-wider">North Dunne</p>
        <p className="text-lg text-neutral-400">presents</p>
      </div>

      <div className={cn(
        'absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000',
        isVisible('neoGames') ? 'opacity-100' : 'opacity-0'
      )}>
        <NeoGamesLogo />
        <p className="text-lg text-neutral-400">in association with</p>
        <p className="font-headline text-2xl tracking-wider">Neo Games</p>
      </div>
    </div>
  );
};
