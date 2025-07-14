
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { AbilityConfig, AbilityKey } from '@/lib/game';
import { cn } from '@/lib/utils';

interface AbilityDisclaimerProps {
  open: boolean;
  onProceed: (config: AbilityConfig) => void;
  onBack: () => void;
}

const initialConfig: AbilityConfig = {
  sonar: true,
  tomahawk: true,
  mine: true,
  submarineTorpedo: true,
};

const abilityDetails: Record<AbilityKey, { title: string, description: string }> = {
    sonar: {
        title: "Sonar Scan",
        description: "Scan a 3x3 area to reveal enemy ships.",
    },
    tomahawk: {
        title: "Tomahawk Strike",
        description: "Launch a strike on a 3x3 area, hitting 9 cells.",
    },
    mine: {
        title: "Defensive Mines",
        description: "Place mines that detonate when an enemy fires on them.",
    },
    submarineTorpedo: {
        title: "Submarine Torpedo",
        description: "Fire a torpedo from your Submarine to hit an entire row or column.",
    }
}

export function AbilityDisclaimer({ open, onProceed, onBack }: AbilityDisclaimerProps) {
  const [abilityConfig, setAbilityConfig] = useState<AbilityConfig>(initialConfig);

  const handleToggle = (ability: AbilityKey) => {
    setAbilityConfig(prev => ({ ...prev, [ability]: !prev[ability] }));
  };

  const handleProceed = () => {
    onProceed(abilityConfig);
  }

  const isProceedDisabled = Object.values(abilityConfig).every(v => v === false);

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onBack()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl">Configure Abilities</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-base text-left pt-2 space-y-4">
              <p>
                Enable or disable abilities for this match. Each player gets a limited number of uses per enabled ability.
              </p>
              <div className="space-y-4">
                {(Object.keys(abilityDetails) as AbilityKey[]).map((key) => {
                    const isEnabled = abilityConfig[key];
                    return (
                        <div key={key} className="flex items-center space-x-4 p-3 bg-secondary/50 rounded-lg transition-all">
                            <Switch
                                id={key}
                                checked={isEnabled}
                                onCheckedChange={() => handleToggle(key)}
                            />
                            <Label htmlFor={key} className="flex-1 cursor-pointer">
                                <p className="font-medium text-foreground">{abilityDetails[key].title}</p>
                                <p className="text-sm text-muted-foreground font-normal">{abilityDetails[key].description}</p>
                            </Label>
                        </div>
                    )
                })}
              </div>
               {isProceedDisabled && (
                <p className="text-sm text-center text-destructive font-medium pt-2">
                  You must select at least one ability to proceed.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onBack}>Wait, nevermind</AlertDialogCancel>
          <AlertDialogAction onClick={handleProceed} disabled={isProceedDisabled}>Proceed</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
