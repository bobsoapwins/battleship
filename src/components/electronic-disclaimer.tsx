
'use client';

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

interface ElectronicDisclaimerProps {
  open: boolean;
  onProceed: () => void;
  onBack: () => void;
}

export function ElectronicDisclaimer({ open, onProceed, onBack }: ElectronicDisclaimerProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl">A small disclaimer</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-base text-left pt-2 space-y-2">
              <p>
                This game mode introduces special abilities. Each player gets a limited number of uses per ability.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Sonar:</strong> Scan a 3x3 area to reveal enemy ships for one turn.
                </li>
                <li>
                  <strong>Tomahawk:</strong> Launch a strike on a 3x3 area, hitting all cells simultaneously.
                </li>
                <li>
                  <strong>Mines:</strong> Place defensive mines on your grid during setup. If an enemy fires on a mined cell, it detonates and damages their own fleet in a 3x3 area.
                </li>
              </ul>
              <p>
                Use your abilities wisely to gain the upper hand!
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onBack}>Wait, nevermind</AlertDialogCancel>
          <AlertDialogAction onClick={onProceed}>Proceed</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
