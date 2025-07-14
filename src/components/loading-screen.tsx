
'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  onComplete: () => void;
}

const loadingSequence = [
  { progress: 25, delay: 500 },
  { progress: 60, delay: 800 },
  { progress: 90, delay: 600 },
  { progress: 100, delay: 400 },
];

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentIndex = 0;

    const runSequence = () => {
      if (currentIndex >= loadingSequence.length) {
        setTimeout(onComplete, 500); // Wait a bit after 100%
        return;
      }

      const currentStep = loadingSequence[currentIndex];
      setTimeout(() => {
        setProgress(currentStep.progress);
        currentIndex++;
        runSequence();
      }, currentStep.delay);
    };
    
    // Start the sequence
    const initialTimeout = setTimeout(() => {
        setProgress(10);
        runSequence();
    }, 100);

    return () => clearTimeout(initialTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-end">
      <div className="w-full p-4">
        <Progress value={progress} className="h-1 bg-white/20 [&>div]:bg-white" />
      </div>
    </div>
  );
};
