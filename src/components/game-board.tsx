
'use client';

import type { FC } from 'react';
import { Target, Waves, Ship as ShipIcon, Skull } from 'lucide-react';
import type { Board, Ship, Point } from '@/lib/game';
import { GRID_SIZE } from '@/lib/game';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  boardData: Board;
  ships: Ship[];
  onCellClick: (x: number, y: number) => void;
  isPlayerBoard: boolean;
  disabled?: boolean;
  lastShot?: Point | null;
  revealShips?: boolean;
  scannedArea?: Point[] | null;
}

export const GameBoard: FC<GameBoardProps> = ({ boardData, ships, onCellClick, isPlayerBoard, disabled = false, lastShot, revealShips = false, scannedArea = null }) => {
  
  const getShipAt = (x: number, y: number) => {
    return ships.find(ship => ship.positions.some(pos => pos.x === x && pos.y === y));
  };
  
  const isSunk = (ship: Ship | undefined) => ship?.sunk;

  const isScanned = (x: number, y: number) => {
    if (!scannedArea) return false;
    return scannedArea.some(pos => pos.x === x && pos.y === y);
  };
  
  const renderCellContent = (x: number, y: number) => {
    const cell = boardData[y][x];
    const ship = getShipAt(x, y);

    switch (cell) {
      case 'hit':
        return isSunk(ship) 
          ? <Skull className="w-5 h-5 text-red-700" />
          : <Target className="w-5 h-5 text-red-500" />;
      case 'miss':
        return <Waves className="w-5 h-5 text-white/70" />;
      case 'ship':
        if (isPlayerBoard || revealShips || isScanned(x, y)) {
          return <ShipIcon className="w-5 h-5 text-primary-foreground/80" />;
        }
        return null; // Hide opponent ships
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-10 grid-rows-10 gap-1 bg-primary/20 p-2 rounded-lg shadow-inner aspect-square w-full max-w-sm mx-auto md:max-w-md lg:max-w-lg">
      {boardData.map((row, y) =>
        row.map((cell, x) => {
          const ship = getShipAt(x, y);
          const isShipSunk = isSunk(ship);
          const isLastShot = lastShot?.x === x && lastShot.y === y;
          const showShip = isPlayerBoard || (revealShips && cell === 'ship');
          const cellIsScanned = !isPlayerBoard && isScanned(x, y);
          
          return (
            <div
              key={`${x}-${y}`}
              onClick={() => !disabled && onCellClick(x, y)}
              className={cn(
                'w-full h-full rounded-sm flex items-center justify-center aspect-square transition-colors duration-200 relative',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-accent/50',
                showShip ? 'bg-primary/80' : 'bg-primary/40',
                cell === 'hit' && 'bg-red-500/80',
                isShipSunk && 'bg-red-800/80',
                cell === 'miss' && 'bg-blue-300/50',
                cellIsScanned && 'bg-accent/70 animate-pulse',
                isLastShot && 'animate-shot z-10'
              )}
            >
              {renderCellContent(x, y)}
            </div>
          );
        })
      )}
    </div>
  );
};
