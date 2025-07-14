
'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
      if(progress === 100) {
          const timer = setTimeout(() => onComplete(), 1000);
          return () => clearTimeout(timer);
      }
  }, [progress, onComplete])

  return (
    <div className="fixed inset-0 bg-black flex items-end">
      <div className="w-full p-4">
        <Progress value={progress} className="h-1 bg-white/20 [&>div]:bg-white" />
      </div>
    </div>
  );
};
