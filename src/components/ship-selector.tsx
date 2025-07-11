'use client';

import type { FC } from 'react';
import { RotateCw, RefreshCcw } from 'lucide-react';
import type { ShipType, Orientation } from '@/lib/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ShipSelectorProps {
  shipToPlace: ShipType;
  orientation: Orientation;
  onToggleOrientation: () => void;
  onResetBoard: () => void;
  shipsPlacedCount: number;
  totalShips: number;
  placementComplete: boolean;
}

export const ShipSelector: FC<ShipSelectorProps> = ({
  shipToPlace,
  orientation,
  onToggleOrientation,
  onResetBoard,
  shipsPlacedCount,
  totalShips,
  placementComplete,
}) => {
  
  const progress = ((placementComplete ? totalShips : shipsPlacedCount) / totalShips) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Place Your Fleet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-muted-foreground">
            {placementComplete ? 'Fleet placement complete!' : `Placing ship ${shipsPlacedCount + 1} of ${totalShips}`}
          </p>
          <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="p-4 bg-secondary rounded-lg text-center space-y-2 min-h-[116px] flex flex-col justify-center items-center">
          {!placementComplete && shipToPlace && (
            <>
              <p className="font-bold text-lg">{shipToPlace.name}</p>
              <p className="text-sm text-muted-foreground">Size: {shipToPlace.size}</p>
              <div className="flex justify-center items-center gap-2 pt-2">
                <div
                  className={'flex flex-row gap-1 p-1 bg-primary/40 rounded'}
                >
                  {Array.from({ length: shipToPlace.size }).map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-primary rounded-sm" />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onToggleOrientation} variant="outline" disabled={placementComplete}>
            <RotateCw className="mr-2 h-4 w-4" />
            Orientation
          </Button>
          <Button onClick={onResetBoard} variant="destructive" disabled={placementComplete}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset Board
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
