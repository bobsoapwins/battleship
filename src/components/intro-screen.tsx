
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface IntroScreenProps {
  onComplete: () => void;
}

type AnimationPhase = 'idle' | 'northDunne' | 'neoGames' | 'battleship' | 'done';

const NorthDunneLogo = () => (
    <div className="w-32 h-32 relative mb-4 rounded-full overflow-hidden">
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
    <div className="w-32 h-32 relative mb-4 rounded-full overflow-hidden">
        <Image 
            src="https://sdmntprwestus.oaiusercontent.com/files/00000000-ac18-6230-a932-b4be71918eac/raw?se=2025-07-10T00%3A22%3A15Z&sp=r&sv=2024-08-04&sr=b&scid=d6a23786-9079-59e3-9f62-0e8ac3580a67&skoid=c156db82-7a33-468f-9cdd-06af263ceec8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-09T20%3A27%3A06Z&ske=2025-07-10T20%3A27%3A06Z&sks=b&skv=2024-08-04&sig=OIc7ZMDbzcqlrwku8nGuDeN6rQI2qntH2BXAOr%2BNHzs%3D"
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
      () => setPhase('battleship'), // Show Battleship title
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

      <div className={cn(
        'absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000',
        isVisible('battleship') ? 'opacity-100' : 'opacity-0'
      )}>
        <h1 className="font-headline text-6xl tracking-widest uppercase">Battleship</h1>
        <p className="text-xl text-neutral-400 mt-2">Web Version</p>
      </div>
    </div>
  );
};
