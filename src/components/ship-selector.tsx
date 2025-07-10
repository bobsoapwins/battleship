'use client';

import type { FC } from 'react';
import { RotateCw } from 'lucide-react';
import type { ShipType, Orientation } from '@/lib/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ShipSelectorProps {
  shipToPlace: ShipType;
  orientation: Orientation;
  onToggleOrientation: () => void;
  shipsPlacedCount: number;
  totalShips: number;
  placementComplete: boolean;
}

export const ShipSelector: FC<ShipSelectorProps> = ({
  shipToPlace,
  orientation,
  onToggleOrientation,
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

        <div className="p-4 bg-secondary rounded-lg text-center space-y-2 min-h-[116px]">
          {!placementComplete && shipToPlace && (
            <>
              <p className="font-bold text-lg">{shipToPlace.name}</p>
              <p className="text-sm text-muted-foreground">Size: {shipToPlace.size}</p>
              <div className="flex justify-center items-center gap-2 pt-2">
                <div
                  className={cn('flex bg-primary/40 rounded', {
                    'flex-row gap-1 p-1': orientation === 'horizontal',
                    'flex-col gap-1 p-1': orientation === 'vertical',
                  })}
                >
                  {Array.from({ length: shipToPlace.size }).map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-primary rounded-sm" />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <Button onClick={onToggleOrientation} className="w-full" variant="outline" disabled={placementComplete}>
          <RotateCw className="mr-2 h-4 w-4" />
          Toggle Orientation ({orientation})
        </Button>
      </CardContent>
    </Card>
  );
};
