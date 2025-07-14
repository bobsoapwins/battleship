
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface IntroScreenProps {
  onComplete: () => void;
}

type AnimationPhase = 'idle' | 'northDunne' | 'black1' | 'neoGames' | 'black2' | 'battleship' | 'battleshipTransition' | 'done';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.play().catch(error => {
            // Autoplay was prevented.
            console.log("Audio autoplay was prevented by the browser.");
        });
    }

    const sequence: { phase: AnimationPhase, duration: number }[] = [
      { phase: 'northDunne', duration: 2000 },
      { phase: 'black1', duration: 1000 },
      { phase: 'neoGames', duration: 2000 },
      { phase: 'black2', duration: 1000 },
      { phase: 'battleship', duration: 2000 },
      { phase: 'battleshipTransition', duration: 2000 },
      { phase: 'done', duration: 1000 },
    ];

    let currentIndex = 0;
    const runSequence = () => {
      if (currentIndex >= sequence.length) {
        return;
      }
      
      const current = sequence[currentIndex];
      setPhase(current.phase);

      if (current.phase === 'done') {
        setTimeout(onComplete, current.duration);
      } else {
        setTimeout(() => {
          currentIndex++;
          runSequence();
        }, current.duration);
      }
    };
    
    runSequence();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVisible = (p: AnimationPhase) => phase === p;

  const bgClass = cn(
    "min-h-screen w-full flex items-center justify-center overflow-hidden transition-all duration-1000",
    phase === 'done' ? 'opacity-0' : 'opacity-100',
    (phase === 'battleshipTransition' || phase === 'done') ? 'bg-[#d5e4f9]' : 'bg-black'
  );

  const battleshipTextClass = cn(
      'font-headline text-6xl tracking-widest uppercase transition-colors duration-1000',
      phase === 'battleshipTransition' || phase === 'done' ? 'text-black' : 'text-neutral-200'
  )

  return (
    <div className={bgClass}>
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/08/23/audio_82131975cb.mp3" preload="auto" />
      <div className={cn(
        'absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000',
        isVisible('northDunne') ? 'opacity-100' : 'opacity-0'
      )}>
        <NorthDunneLogo />
        <p className="font-headline text-2xl tracking-wider text-neutral-200">North Dunne</p>
        <p className="text-lg text-neutral-400">presents</p>
      </div>

      <div className={cn(
        'absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000',
        isVisible('neoGames') ? 'opacity-100' : 'opacity-0'
      )}>
        <NeoGamesLogo />
        <p className="text-lg text-neutral-400">in association with</p>
        <p className="font-headline text-2xl tracking-wider text-neutral-200">Neo Games</p>
      </div>

      <div className={cn(
        'absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000',
        (isVisible('battleship') || isVisible('battleshipTransition') || phase === 'done') ? 'opacity-100' : 'opacity-0'
      )}>
        <h1 className={battleshipTextClass}>Battleship</h1>
      </div>
    </div>
  );
};
